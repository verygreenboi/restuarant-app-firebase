import { Request, Response } from 'express';
import { Endpoint, RequestType } from 'firebase-backend';

export default new Endpoint(
  'addNewOrder',
  RequestType.POST,
  async (req: Request, res: Response) => {
    const { headers, body, query, params } = req;
    console.log({ headers, body, query, params });
    return res.status(200).send({message: 'Order added successfully.'});
  }
);
