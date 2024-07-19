import { addMetadata } from '../utils/metadata.util';

export const AddAttribute = (key: string, value: any) =>
  addMetadata(key, value);
