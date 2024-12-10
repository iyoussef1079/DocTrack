import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { AuthService } from '../auth.service';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService {
  private oauth2Client: OAuth2Client;

  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    this.oauth2Client = new OAuth2Client({
      clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      redirectUri: this.configService.get<string>('GOOGLE_CALLBACK_URL'),
    });
  }

  private getDriveClient(accessToken: string) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    return google.drive({ 
      version: 'v3', 
      auth: this.oauth2Client
    });
  }

  private bufferToStream(buffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  async uploadFile(userEmail: string, fileBuffer: Buffer, filename: string) {
    const user = await this.authService.getUser(userEmail);
    if (!user || !user.accessToken) {
      throw new UnauthorizedException('No valid Google access token found');
    }

    const drive = this.getDriveClient(user.accessToken);
    const stream = this.bufferToStream(fileBuffer);

    try {
      const response = await drive.files.create({
        requestBody: {
          name: filename,
        },
        media: {
          mimeType: 'text/plain',
          body: stream
        },
        fields: 'id, webViewLink'
      });

      return {
        success: true,
        fileId: response.data.id,
        webViewLink: response.data.webViewLink
      };
    } catch (error) {
      console.error('Upload error details:', error.response?.data || error);
      if (error.code === 401) {
        // Token expired, try to refresh
        await this.authService.refreshToken(userEmail);
        throw new Error('Token expired, please try again');
      }
      throw new Error(error.message || 'Failed to upload file');
    }
  }
}