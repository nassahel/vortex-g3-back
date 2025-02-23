import { Rol } from '@prisma/client';
export const users = [
  {
    name: 'Joaquin Medina',
    email: 'joaquinmedinadev0@gmail.com',
    password: 'admin.01', // contraseña: admin123
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
    password: 'user123',
    rol: Rol.USER,
  },
  {
    name: 'Usuario Demo',
    email: 'user@demo.com',
    password: 'user123',
    rol: Rol.USER,
  },
  {
    name: 'Usuario Test',
    email: 'test@test.com',
    password: 'user123',
    rol: Rol.USER,
  },
];

export const categories = [
  { name: 'Electrónicos' },
  { name: 'Computación' },
  { name: 'Celulares' },
  { name: 'Audio' },
  { name: 'Videojuegos' },
  { name: 'Accesorios' },
  { name: 'Hogar' },
  { name: 'Deportes' },
  { name: 'Ropa' },
  { name: 'Calzado' },
];

export const products = [
  {
    name: 'iPhone 14 Pro',
    description: 'Último modelo de iPhone con cámara de 48MP y chip A16 Bionic',
    price: 999.99,
    stock: 50,
    categories: ['Electrónicos', 'Celulares'],
  },
  {
    name: 'MacBook Pro M2',
    description: 'Laptop Apple con chip M2, 16GB RAM, 512GB SSD',
    price: 1299.99,
    stock: 30,
    categories: ['Electrónicos', 'Computación'],
  },
  {
    name: 'AirPods Pro',
    description: 'Auriculares inalámbricos con cancelación de ruido',
    price: 249.99,
    stock: 100,
    categories: ['Electrónicos', 'Audio', 'Accesorios'],
  },
  {
    name: 'PlayStation 5',
    description: 'Consola de videojuegos de última generación',
    price: 499.99,
    stock: 25,
    categories: ['Electrónicos', 'Videojuegos'],
  },
  {
    name: 'Samsung Galaxy S23',
    description: 'Smartphone Android de gama alta con cámara de 108MP',
    price: 899.99,
    stock: 45,
    categories: ['Electrónicos', 'Celulares'],
  },
  {
    name: 'Nike Air Max',
    description: 'Zapatillas deportivas con tecnología Air',
    price: 129.99,
    stock: 80,
    categories: ['Calzado', 'Deportes'],
  },
  {
    name: 'Smart TV Samsung 65"',
    description: 'Televisor 4K con tecnología QLED',
    price: 799.99,
    stock: 15,
    categories: ['Electrónicos', 'Hogar'],
  },
  {
    name: 'Camiseta Deportiva Nike',
    description: 'Camiseta transpirable para entrenamiento',
    price: 34.99,
    stock: 150,
    categories: ['Ropa', 'Deportes'],
  },
  {
    name: 'Monitor Gaming 27"',
    description: 'Monitor 144Hz 2K para gaming',
    price: 299.99,
    stock: 40,
    categories: ['Electrónicos', 'Computación', 'Videojuegos'],
  },
  {
    name: 'Teclado Mecánico RGB',
    description: 'Teclado gaming con switches Cherry MX',
    price: 89.99,
    stock: 60,
    categories: ['Computación', 'Videojuegos', 'Accesorios'],
  },
];
