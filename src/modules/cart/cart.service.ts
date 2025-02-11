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
    async addItemToCart(userId: string, addCartItemDto: AddCartItemDto): Promise <{ message: string }>{  //Agrega un producto al carrito o lo actualiza si ya existe.
        const { productId, quantity } = addCartItemDto;

        const product = await this.prisma.product.findUnique({      //Busca el producto
            where: { id: productId },
        });

        if(!product){
            throw new NotFoundException('Product not found');   // En el cas de q no exista tira un error
        }

        const cart = await this.getActiveCart(userId);      //Obtiene el carrito activo

        const existingItem = await this.prisma.orderItem.findFirst({        //verifica si el producto ya esta en el carrito
            where: { orderId: cart.id, productId },
        });

        if (existingItem){
            const newQuantity = existingItem.quantity + quantity;       

            await this.prisma.orderItem.update({    //Si ya esta, actualiza la cantidad
                where: {id: existingItem.id},
                data: { quantity: newQuantity },
            })
        } else {
            await this.prisma.orderItem.create({        //agrega el nuevo item al carrito
                data: {
                    orderId: cart.id,
                    productId,
                    quantity,
                    price: product.price,
                }
            })
        }

        return {message: "Item added to cart"};
    }

    
    
}
