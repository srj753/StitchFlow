import { useToast } from '@/hooks/useToast';
import { ToastManager } from './Toast';

export function ToastManagerWrapper() {
  const { toasts, removeToast } = useToast();
  return <ToastManager toasts={toasts} onRemove={removeToast} />;
}

