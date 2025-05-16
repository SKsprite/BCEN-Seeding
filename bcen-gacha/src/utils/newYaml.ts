// utils/newYaml.ts
import fs from 'fs';
import path from 'path';
import { parse } from 'yaml';
import type { BCEnSchema } from '@/types/bcEn';

export function loadBCEn(): BCEnSchema {
    const yamlPath = path.join(process.cwd(), 'public', 'bc-en.yaml');
    const fileContent = fs.readFileSync(yamlPath, 'utf-8');
    return parse(fileContent) as BCEnSchema;
}
