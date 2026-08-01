import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import {
  experienceSchema,
  projectSchema,
  serviceSchema,
  writingSchema,
} from './content/schemas';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.mdx' }),
  schema: projectSchema,
});

const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/*.mdx' }),
  schema: writingSchema,
});

const services = defineCollection({
  loader: file('./src/data/services.yaml'),
  schema: serviceSchema,
});

const experience = defineCollection({
  loader: file('./src/data/experience.yaml'),
  schema: experienceSchema,
});

export const collections = { projects, writing, services, experience };
