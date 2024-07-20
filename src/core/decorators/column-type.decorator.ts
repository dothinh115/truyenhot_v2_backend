import { addMetadata } from '../utils/metadata.util';
type TColumnType = 'richText' | 'string' | 'number';

export const ColumnType = (value: TColumnType) => addMetadata('type', value);
