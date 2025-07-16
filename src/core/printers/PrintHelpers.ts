import { postRequest } from '../../helpers/requests';
import { PrintLocation, PrintType } from '../../types/basic.types';
import { strings } from '../localization/strings';
import { toast } from '../utils';

export const handleRePrintOrder = async (
  orderId: number,
  printLocation = PrintLocation.ALL,
  printType = PrintType.PERSONEL,
  isAnalysis = false,
  setIsSending: (val: boolean) => void
) => {
  try {
    setIsSending(true);
    const data = { printType, printLocation, isAnalysis };
    const result = await postRequest(`/orders/orderPrint/${orderId}`, data);
    if (result) {
      toast('success', 'Success', '', 1000);
    }
  } finally {
    setIsSending(false);
  }
};
