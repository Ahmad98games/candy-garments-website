import React from 'react';
import { CollectionLayout } from '../components/catalog/CollectionLayout';

export default function OmnoraCollection({ defaultDepartment }: { defaultDepartment?: 'Ladies' | 'Kids' }) {
  const preset = defaultDepartment === 'Ladies' ? 'ladies' : defaultDepartment === 'Kids' ? 'kids' : 'all';
  return <CollectionLayout presetType={preset} />;
}
