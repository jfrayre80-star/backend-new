import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { parse as parseCsv } from "csv-parse/sync";
import { XMLParser } from "fast-xml-parser";
import * as bcrypt from "bcrypt";

import { Students } from "../users/Students";
import { Users } from "../users/Users";
import { Parents } from "../users/Parents";
import { Specialties } from "../academic/Specialties";

/**
 * Campos mínimos esperados en cada fila del archivo.
 */
interface ImportedStudent {
  firstName: string;
  lastName: string;
  email: string;
  enrollmentNumber: string;
  admissionScore: string;
  specialtyCode?: string;
  parentEmail?: string;
  parentFirstName?: string;
  parentLastName?: string;
}

/**
 * Servicio de carga masiva (RF-05).
 *
 * Recibe el archivo subido por el administrador, detecta su formato (CSV o
 * XML), lo convierte a filas, valida los datos y crea los alumnos aceptados.
 * Las filas se procesan en orden de puntaje de admisión descendente y se les
 * asigna la especialidad correspondiente.
 */
@Injectable()
export class ImportsService {
  constructor(
    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    @InjectRepository(Parents)
    private readonly parentsRepository: Repository<Parents>,

    @InjectRepository(Specialties)
    private readonly specialtiesRepository: Repository<Specialties>,
  ) {}

  /**
   * Detecta el formato del archivo según su extensión.
   */
  private detectFormat(fileName: string): "csv" | "xml" {
    const name = fileName.toLowerCase();
    if (name.endsWith(".csv")) return "csv";
    if (name.endsWith(".xml")) return "xml";
    throw new BadRequestException(
      "El archivo debe ser de formato .csv o .xml.",
    );
  }

  /**
   * Parsea el contenido CSV a un arreglo de alumnos importados.
   * El encabezado debe incluir: firstName, lastName, email, enrollmentNumber,
   * admissionScore (y opcionalmente specialtyCode, parentEmail, parentFirstName,
   * parentLastName).
   */
  private parseCsvContent(content: string): ImportedStudent[] {
    const records: Array<Record<string, unknown>> = parseCsv(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
    });

    return records.map((record) => this.normalizeRow(record));
  }

  /**
   * Parsea el contenido XML a un arreglo de alumnos importados.
   * Estructura esperada:
   *   <students>
   *     <student>
   *       <firstName>...</firstName>
   *       <lastName>...</lastName>
   *       <email>...</email>
   *       <enrollmentNumber>...</enrollmentNumber>
   *       <admissionScore>...</admissionScore>
   *       <specialtyCode>...</specialtyCode>
   *     </student>
   *   </students>
   */
  private parseXmlContent(content: string): ImportedStudent[] {
    const parser = new XMLParser({
      ignoreAttributes: false,
      trimValues: true,
    });

    let parsed: Record<string, unknown> | undefined;
    try {
      parsed = parser.parse(content) as Record<string, unknown>;
    } catch {
      throw new BadRequestException("El archivo XML no es válido.");
    }

    const root: Record<string, unknown> =
      (parsed.students as Record<string, unknown>) ??
      (parsed.Students as Record<string, unknown>) ??
      parsed;

    const studentNode = root.student as
      | Record<string, unknown>
      | Array<Record<string, unknown>>
      | undefined;
    const rawStudents = Array.isArray(studentNode)
      ? studentNode
      : studentNode
        ? [studentNode]
        : [];

    return rawStudents.map((record) => this.normalizeRow(record));
  }

  /**
   * Normaliza una fila (objeto plano) a un alumno importado, buscando los
   * nombres de campo tanto en español como en inglés.
   */
  private normalizeRow(record: Record<string, unknown>): ImportedStudent {
    const pick = (...keys: string[]): string | undefined => {
      for (const key of keys) {
        const value = record[key];
        if (value === undefined || value === null) continue;
        const text =
          typeof value === "string" || typeof value === "number"
            ? String(value).trim()
            : "";
        if (text === "") continue;
        return text;
      }
      return undefined;
    };

    return {
      firstName: pick("firstName", "first_name", "nombre", "nombres") ?? "",
      lastName:
        pick(
          "lastName",
          "last_name",
          "apellido",
          "apellidos",
          "apellidoPaterno",
        ) ?? "",
      email: pick("email", "correo") ?? "",
      enrollmentNumber:
        pick(
          "enrollmentNumber",
          "enrollment_number",
          "matricula",
          "noControl",
        ) ?? "",
      admissionScore:
        pick(
          "admissionScore",
          "admission_score",
          "puntaje",
          "puntajeAdmision",
        ) ?? "",
      specialtyCode: pick(
        "specialtyCode",
        "specialty_code",
        "especialidad",
        "specialty",
      ),
      parentEmail: pick("parentEmail", "parent_email", "correoPadre"),
      parentFirstName: pick(
        "parentFirstName",
        "parent_first_name",
        "nombrePadre",
      ),
      parentLastName: pick(
        "parentLastName",
        "parent_last_name",
        "apellidoPadre",
      ),
    };
  }

  /**
   * Valida que una fila tenga los campos obligatorios del alumno.
   */
  private validateRow(row: ImportedStudent, index: number) {
    const errors: string[] = [];

    if (!row.firstName) errors.push("firstName");
    if (!row.lastName) errors.push("lastName");
    if (!row.email) errors.push("email");
    if (!row.enrollmentNumber) errors.push("enrollmentNumber");
    if (!row.admissionScore) errors.push("admissionScore");

    if (errors.length > 0) {
      throw new BadRequestException(
        `Fila ${index + 1}: faltan los campos obligatorios: ${errors.join(", ")}.`,
      );
    }

    if (Number.isNaN(Number(row.admissionScore))) {
      throw new BadRequestException(
        `Fila ${index + 1}: el puntaje de admisión debe ser numérico.`,
      );
    }
  }

  /**
   * Resuelve la especialidad de una fila (por código) o usa la especialidad por
   * defecto indicada en la petición.
   */
  private async resolveSpecialty(
    row: ImportedStudent,
    defaultSpecialtyId?: string,
  ): Promise<Specialties | null> {
    if (row.specialtyCode) {
      const specialty = await this.specialtiesRepository.findOne({
        where: { code: row.specialtyCode },
      });
      if (!specialty) {
        throw new NotFoundException(
          `La especialidad con código "${row.specialtyCode}" no existe.`,
        );
      }
      return specialty;
    }

    if (defaultSpecialtyId) {
      const specialty = await this.specialtiesRepository.findOne({
        where: { id: defaultSpecialtyId },
      });
      return specialty ?? null;
    }

    return null;
  }

  /**
   * Crea un usuario de la plataforma con un password temporal.
   */
  private async createUser(
    email: string,
    firstName: string,
    lastName: string,
    role: "student" | "parent",
  ): Promise<Users> {
    const passwordHash = await bcrypt.hash("Temp1234!", 10);
    return this.usersRepository.save(
      this.usersRepository.create({
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        isActive: true,
        mustChangePassword: true,
      }),
    );
  }

  /**
   * Procesa el archivo subido: lo convierte a filas, las ordena por puntaje y
   * crea los alumnos con sus cuentas. Devuelve un resumen de lo importado.
   */
  async importStudents(file: Express.Multer.File, defaultSpecialtyId?: string) {
    if (!file) {
      throw new BadRequestException(
        'Debes enviar un archivo en el campo "file".',
      );
    }

    const format = this.detectFormat(file.originalname);
    const content = file.buffer.toString("utf-8");

    let rows: ImportedStudent[];
    if (format === "csv") {
      rows = this.parseCsvContent(content);
    } else {
      rows = this.parseXmlContent(content);
    }

    if (rows.length === 0) {
      throw new BadRequestException("El archivo no contiene alumnos.");
    }

    // Validar todas las filas antes de insertar.
    rows.forEach((row, index) => this.validateRow(row, index));

    // RF-05: los alumnos aceptados se ordenan por puntaje de admisión.
    const sorted = [...rows].sort(
      (a, b) => Number(b.admissionScore) - Number(a.admissionScore),
    );

    const imported: Array<{
      enrollmentNumber: string;
      fullName: string;
      admissionScore: string | null;
      specialty: string | null;
    }> = [];
    const errors: string[] = [];

    for (const row of sorted) {
      try {
        // Evitar duplicados de matrícula o email.
        const existingStudent = await this.studentsRepository.findOne({
          where: { enrollmentNumber: row.enrollmentNumber },
        });
        if (existingStudent) {
          errors.push(`Matrícula ${row.enrollmentNumber} ya registrada.`);
          continue;
        }

        const existingEmail = await this.usersRepository.findOne({
          where: { email: row.email },
        });
        if (existingEmail) {
          errors.push(`Email ${row.email} ya registrado.`);
          continue;
        }

        const specialty = await this.resolveSpecialty(row, defaultSpecialtyId);

        // Crear la cuenta del alumno.
        const studentUser = await this.createUser(
          row.email,
          row.firstName,
          row.lastName,
          "student",
        );

        // Crear la cuenta del padre vinculada al alumno.
        const parentEmail =
          row.parentEmail ?? `tutor.${row.enrollmentNumber}@cecytech.edu.mx`;
        let parentUser: Users | null = null;
        let parent = await this.parentsRepository.findOne({
          where: { user: { email: parentEmail } },
          relations: { user: true },
        });

        if (!parent) {
          parentUser = await this.createUser(
            parentEmail,
            row.parentFirstName || "Tutor",
            row.parentLastName || row.lastName,
            "parent",
          );
          parent = await this.parentsRepository.save(
            this.parentsRepository.create({
              user: { id: parentUser.id },
            }),
          );
        }

        // Crear el registro del alumno con su puntaje y especialidad.
        const student = await this.studentsRepository.save(
          this.studentsRepository.create({
            userId: studentUser.id,
            parentId: parent.id,
            enrollmentNumber: row.enrollmentNumber,
            admissionScore: Number(row.admissionScore).toFixed(2),
            specialtyId: specialty?.id ?? null,
            isDual: false,
            enrollmentDate: new Date().toISOString().slice(0, 10),
          }),
        );

        imported.push({
          enrollmentNumber: student.enrollmentNumber,
          fullName: `${row.firstName} ${row.lastName}`,
          admissionScore: student.admissionScore,
          specialty: specialty?.code ?? null,
        });
      } catch (error) {
        errors.push(
          `Error al importar ${row.enrollmentNumber}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return {
      message: "Importación finalizada.",
      totalRows: sorted.length,
      importedCount: imported.length,
      errorCount: errors.length,
      imported,
      errors,
    };
  }
}
