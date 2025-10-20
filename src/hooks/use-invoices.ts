// hooks/use-invoices.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Invoice, InvoicesQueryParams, CreateInvoiceDto } from '@/types/billing';
import { InvoicesService } from '@/lib/services/invoices.service';

const invoicesService = new InvoicesService();

export const useInvoices = (params: InvoicesQueryParams = {}) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoicesService.getInvoices(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoicesService.getInvoiceById(id),
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateInvoiceDto) => invoicesService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useMarkInvoiceAsPaid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, amount, date }: { id: string; amount: number; date?: Date }) =>
      invoicesService.markInvoiceAsPaid(id, amount, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useVoidInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => invoicesService.voidInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useSendInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => invoicesService.sendInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: (id: string) => invoicesService.downloadInvoicePdf(id),
  });
};