import { UIConfigField } from '@/lib/config/types';
import SettingsField from '../SettingsField';

type SearchEnvStatus = Record<string, { envVar: string; isSet: boolean }>;

const Search = ({
  fields,
  values,
  envStatus,
}: {
  fields: UIConfigField[];
  values: Record<string, any>;
  envStatus?: SearchEnvStatus;
}) => {
  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
      {fields.map((field) => (
        <SettingsField
          key={field.key}
          field={field}
          value={
            (field.scope === 'client'
              ? localStorage.getItem(field.key)
              : values[field.key]) ?? field.default
          }
          dataAdd="search"
          envVar={envStatus?.[field.key]?.envVar}
          envIsSet={envStatus?.[field.key]?.isSet}
        />
      ))}
    </div>
  );
};

export default Search;
