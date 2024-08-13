import { getPreferenceValues } from '@raycast/api';
import { Configs } from '../types';

export function getConfigs(): Configs {
  const data = getPreferenceValues<Configs>();
  return data;
}