import { Rol } from '@prisma/client';
export const users = [
  {
    name: 'Joaquin Medina',
    email: 'joaquinmedinadev0@gmail.com',
    password: 'admin123', // contraseña: admin123
    rol: Rol.ADMIN,
  },
  {
    name: 'Admin Usuario',
    email: 'admin@example.com',
    password: 'admin123', // contraseña: admin123
    rol: Rol.ADMIN,
  },
  {
    name: 'Usuario Normal',
    email: 'user@example.com',
    password: 'user123', // contraseña: user123
    rol: Rol.USER,
  },
];

export const categories = [
  { name: 'Electrónicos' },
  { name: 'Ropa' },
  { name: 'Hogar' },
  { name: 'Deportes' },
  { name: 'Juguetes' },
];

export const products = [
  {
    name: 'Smartphone XYZ',
    description: 'Último modelo de smartphone',
    price: 599.99,
    stock: 50,
    categories: ['Electrónicos'],
  },
  {
    name: 'Camiseta Deportiva',
    description: 'Camiseta transpirable',
    price: 29.99,
    stock: 100,
    categories: ['Ropa', 'Deportes'],
  },
];
