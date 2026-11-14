import React from 'react';
import { PermissionAction, PermissionMap, PermissionModule } from '../../types';
import { ALL_PERMISSION_ACTIONS, ALL_PERMISSION_MODULES } from '../../mock-data/seedData';

interface PermissionMatrixProps {
  permissions: PermissionMap;
  onChange?: (next: PermissionMap) => void;
  readOnly?: boolean;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  permissions,
  onChange,
  readOnly = false,
}) => {
  const toggleAction = (mod: PermissionModule, action: PermissionAction) => {
    if (readOnly || !onChange) return;
    const current = permissions[mod] || [];
    const nextMod = current.includes(action)
      ? current.filter((a) => a !== action)
      : [...current, action];
    onChange({ ...permissions, [mod]: nextMod });
  };

  const toggleRow = (mod: PermissionModule) => {
    if (readOnly || !onChange) return;
    const current = permissions[mod] || [];
    const allSelected = ALL_PERMISSION_ACTIONS.every((a) => current.includes(a));
    onChange({
      ...permissions,
      [mod]: allSelected ? [] : [...ALL_PERMISSION_ACTIONS],
    });
  };

  const selectAll = () => {
    if (readOnly || !onChange) return;
    const next = ALL_PERMISSION_MODULES.reduce((acc, mod) => {
      acc[mod] = [...ALL_PERMISSION_ACTIONS];
      return acc;
    }, {} as PermissionMap);
    onChange(next);
  };

  const deselectAll = () => {
    if (readOnly || !onChange) return;
    const next = ALL_PERMISSION_MODULES.reduce((acc, mod) => {
      acc[mod] = [];
      return acc;
    }, {} as PermissionMap);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A]"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={deselectAll}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-[#64748B]"
          >
            Deselect All
          </button>
        </div>
      )}
      <div className="overflow-x-auto border border-[#E8EBF4] rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F9FAFD] border-b border-[#E8EBF4] text-[#64748B]">
              <th className="py-2.5 px-3 font-semibold">Module</th>
              {ALL_PERMISSION_ACTIONS.map((act) => (
                <th key={act} className="py-2.5 px-2 text-center font-semibold whitespace-nowrap">
                  {act}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F3F9]">
            {ALL_PERMISSION_MODULES.map((mod) => {
              const modActions = permissions[mod] || [];
              return (
                <tr key={mod} className="hover:bg-[#F9FAFD]">
                  <td className="py-2.5 px-3 font-medium text-[#0F172A] whitespace-nowrap">
                    {readOnly ? (
                      mod
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleRow(mod)}
                        className="hover:text-[#7050F5] text-left font-medium"
                      >
                        {mod}
                      </button>
                    )}
                  </td>
                  {ALL_PERMISSION_ACTIONS.map((act) => {
                    const checked = modActions.includes(act);
                    return (
                      <td key={act} className="py-2.5 px-2 text-center">
                        <input
                          type="checkbox"
                          disabled={readOnly}
                          checked={checked}
                          aria-label={`${mod} - ${act}`}
                          onChange={() => toggleAction(mod, act)}
                          className="w-4 h-4 rounded border-slate-300 text-[#7050F5] focus:ring-[#7050F5] disabled:opacity-70"
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
