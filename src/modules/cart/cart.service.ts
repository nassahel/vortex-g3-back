import { Injectable, NotFoundException } from '@nestjs/common';
import { AddCartItemDto } from './dto/add.cart.item.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { UpdateCartItemDto } from './dto/update.cart.item.dto';


@Injectable()
export class CartService {
    constructor(
        private readonly prisma: PrismaService,
        //mail service una vez que se implemente
    ){}

    async getActiveCart(userId: string): Promise<object>{        //Obtiene el carrito existente, usa los status pending del usuario. En el caso de que no exista, crea uno nuevo.
        let cart = await this.prisma.order.findFirst({      // Aqui lo busca y lo incluye
            where: { userId, status: 'PENDING'},
            include: { items: true },
        });

        if(!cart){
            cart = await this.prisma.order.create({     //Aqui lo crea
                data: {
                    userId,
                    status: 'PENDING',
                    price: new Decimal(0),
                },
                include: { items: true},
            })
        }
        return cart;
    }

    
}
