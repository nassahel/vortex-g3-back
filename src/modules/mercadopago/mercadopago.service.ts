import { log } from 'console';
import MercadoPagoConfig, { Payment, Preference } from 'mercadopago';
import { PreferenceRequest } from 'mercadopago/dist/clients/preference/commonTypes';
import { mercadopagoConfig } from 'src/common/constants';

export class MercadoPagoService {
  private readonly client: MercadoPagoConfig;

  //configuracion de la conexion con el API de Mercado Pago
  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: mercadopagoConfig.accessToken,
    });
  }

  //creacion de un pago de mp
  async createPayment(orderId: string, amount: number) {
    const preferenceData: PreferenceRequest = {
      items: [
        {
          id: orderId,
          title: `LuxBuy Pedido #${orderId}`,
          unit_price: amount,
          quantity: 1,
          currency_id: 'ARS',
        },
      ],
      back_urls: {
        success: `${mercadopagoConfig.webhookUrl}`,
        failure: `${mercadopagoConfig.webhookUrl}`,
        pending: `${mercadopagoConfig.webhookUrl}`,
      },
      notification_url: mercadopagoConfig.webhookUrl,
      metadata: {
        orderId,
      },
      auto_return: 'approved',
    };

    try {
      const preference = new Preference(this.client);
      const result = await preference.create({ body: preferenceData });
      log(result);
      return result;
    } catch (error) {
      console.error('Error al crear el pago:', error);
      throw new Error('Falló la creación del pago');
    }
  }

  async getPayment(id: string) {
    try {
      const paymentClient = new Payment(this.client);
      const result = await paymentClient.get({ id });
      return result;
    } catch (error) {
      console.error('Error al obtener el pago:', error);
      throw new Error('Falló la obtención del pago');
    }
  }
}
