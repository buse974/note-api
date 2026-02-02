import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { initDB } from './db.js';
import notesRouter from './routes/notes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'note API',
    version: '1.0.0',
    description: 'App de prise de notes rapides avec sauvegarde cloud'
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local' },
    { url: 'https://api.note.51.77.223.61.nip.io', description: 'Production' }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: { 200: { description: 'OK' } }
      }
    },
    '/notes': {
      get: {
        tags: ['Notes'],
        summary: 'Liste toutes les notes',
        responses: {
          200: {
            description: 'Liste des notes',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Note' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['Notes'],
        summary: 'Crée une nouvelle note',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NoteInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Note créée',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Note' }
              }
            }
          },
          400: { description: 'Titre requis' }
        }
      }
    },
    '/notes/{id}': {
      get: {
        tags: ['Notes'],
        summary: 'Récupère une note par ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Note trouvée',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Note' }
              }
            }
          },
          404: { description: 'Note non trouvée' }
        }
      },
      put: {
        tags: ['Notes'],
        summary: 'Met à jour une note',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NoteInput' }
            }
          }
        },
        responses: {
          200: {
            description: 'Note mise à jour',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Note' }
              }
            }
          },
          400: { description: 'Titre requis' },
          404: { description: 'Note non trouvée' }
        }
      },
      delete: {
        tags: ['Notes'],
        summary: 'Supprime une note',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          204: { description: 'Note supprimée' },
          404: { description: 'Note non trouvée' }
        }
      }
    }
  },
  components: {
    schemas: {
      Note: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Ma première note' },
          content: { type: 'string', example: 'Contenu de la note...' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      NoteInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'Ma note' },
          content: { type: 'string', example: 'Contenu...' }
        }
      }
    }
  }
};

app.use(cors());
app.use(express.json());

// Swagger UI route
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/notes', notesRouter);

// Start server
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
