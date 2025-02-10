import { Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/add.cart.item.dto';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class CartService {
    constructor(
        private readonly prisma: PrismaService,
        //mail service una vez que se implemente
    ){}
}
