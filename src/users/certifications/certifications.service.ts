import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCertificationsDto } from './dto/create-certifications.dto';
import { UpdateCertificationsDto } from './dto/update-certifications.dto';
import { ApiResponse } from 'src/common/interfaces/response.interface';

@Injectable()
export class CertificationsService {
  constructor(private prisma: PrismaService) {}
  async addCert(cert: CreateCertificationsDto, userId: number) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    // Create the certificate
    const certificate = await this.prisma.certificate.create({
      data: {
        ...cert,
        userId,
      },
    });

    return {
      success: true,
      message: 'Certificate added successfully.',
      data: certificate,
    };
  }

  async updateCert(id: number, cert: UpdateCertificationsDto, userId: number) {
    // Check if certificate exists
    const certificate = await this.prisma.certificate.findUnique({
      where: { id, userId },
    });
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found.`);
    }
    // update certificate
    const updatedCertificate = await this.prisma.certificate.update({
      where: { id },
      data: {
        ...cert,
      },
    });
    return {
      success: true,
      message: 'Certificate updated successfully.',
      data: updatedCertificate,
    };
  }

  async deleteCert(id: number, userId: number): Promise<ApiResponse<any>> {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id: id, userId },
    });
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found.`);
    }
    // remove certificate from user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        certificates: {
          delete: { id },
        },
      },
    });
    return {
      success: true,
      message: 'Certificate deleted successfully.',
      data: null,
    };
  }
}
