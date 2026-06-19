import { useCallback, useState } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';

import { useToast } from '@hooks/useToast';
import {
  getAdminFormErrorMessage,
  type AdminFormEntity,
} from '@utils/admin-api-errors';

interface UseAdminEntityFormOptions<TPayload> {
  entity: AdminFormEntity;
  isEdit: boolean;
  recordId?: string;
  createFn?: (payload: TPayload) => Promise<unknown>;
  updateFn?: (id: string, payload: TPayload) => Promise<unknown>;
  invalidateKeys: QueryKey[];
  messages: { create: string; update: string };
  onSuccess: () => void;
}

export function useAdminEntityForm<TPayload>({
  entity,
  isEdit,
  recordId,
  createFn,
  updateFn,
  invalidateKeys,
  messages,
  onSuccess,
}: UseAdminEntityFormOptions<TPayload>) {
  const qc = useQueryClient();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const clearSubmitError = useCallback(() => setSubmitError(''), []);

  const submit = useCallback(
    async (payload: TPayload): Promise<boolean> => {
      setLoading(true);
      setSubmitError('');

      try {
        if (isEdit) {
          if (!recordId || !updateFn) {
            throw new Error('Update is not configured');
          }
          await updateFn(recordId, payload);
          toast.success(messages.update);
        } else {
          if (!createFn) {
            throw new Error('Create is not configured');
          }
          await createFn(payload);
          toast.success(messages.create);
        }

        await Promise.all(
          invalidateKeys.map((key) => qc.invalidateQueries({ queryKey: key })),
        );
        onSuccess();
        return true;
      } catch (err: unknown) {
        setSubmitError(getAdminFormErrorMessage(err, entity));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      createFn,
      entity,
      invalidateKeys,
      isEdit,
      messages.create,
      messages.update,
      onSuccess,
      qc,
      recordId,
      toast,
      updateFn,
    ],
  );

  return { submit, loading, submitError, clearSubmitError };
}
