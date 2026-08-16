import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument, OrderStatus } from '../orders/schemas/order.schema';
import { Notification, NotificationDocument } from '../notifications/schemas/notification.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async onModuleInit() {
    await this.seedAll();
  }

  async seedAll() {
    try {
      const productCount = await this.productModel.countDocuments();
      if (productCount === 0) {
        this.logger.log('Seeding initial database data…');
        await this.seedUsers();
        await this.seedProducts();
        await this.seedOrders();
        await this.seedNotifications();
        this.logger.log('Database seeding completed successfully!');
      } else {
        this.logger.log('Database already populated. Skipping seed.');
      }
    } catch (err) {
      this.logger.error('Error during database seeding:', err);
    }
  }

  // ── Admin users only — storefront is guest-based ──────────────────────────
  async seedUsers() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const existing = await this.userModel.countDocuments();
    if (existing > 0) return;

    await this.userModel.create([
      {
        name: 'Store Admin',
        email: 'admin@shop.co',
        password: hashedPassword,
        role: UserRole.ADMIN,
        avatar: '',
      },
      {
        name: 'Super Admin',
        email: 'superadmin@shop.co',
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        avatar: '',
      },
    ]);
    this.logger.log('Seeded admin users: admin@shop.co / superadmin@shop.co (password: password123)');
  }

  // ── Sample product catalogue ───────────────────────────────────────────────
  async seedProducts() {
    const products = [
      {
        name: 'Classic Cotton T-Shirt',
        description: 'A comfortable everyday t-shirt made from 100% pure breathable cotton. Perfect for casual wear.',
        price: 1500,
        salePrice: 1200,
        isOnSale: true,
        category: 'Casual',
        brand: 'SHOP.CO',
        colors: ['White', 'Black', 'Navy'],
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 80,
        sku: 'TSH-COT-001',
        images: ['/images/7.png', '/images/8.png'],
        tags: ['t-shirt', 'casual', 'cotton'],
        rating: 4.5,
        numReviews: 24,
        totalSales: 85,
      },
      {
        name: 'Slim Fit Denim Jeans',
        description: 'Modern slim fit stretch denim jeans with maximum flexibility for day-to-day comfort.',
        price: 3500,
        salePrice: 2999,
        isOnSale: true,
        category: 'Casual',
        brand: 'Denim Co',
        colors: ['Blue', 'Black', 'Grey'],
        sizes: ['28', '30', '32', '34', '36'],
        stock: 40,
        sku: 'JNS-SLM-002',
        images: ['/images/10.png', '/images/11.png'],
        tags: ['jeans', 'denim', 'casual'],
        rating: 4.8,
        numReviews: 42,
        totalSales: 120,
      },
      {
        name: 'Formal Button-Down Shirt',
        description: 'Elegant slim-fit shirt ideal for office and formal occasions. Wrinkle-resistant fabric.',
        price: 2800,
        salePrice: 2800,
        isOnSale: false,
        category: 'Formal',
        brand: 'Urban Trend',
        colors: ['White', 'Light Blue', 'Grey'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        stock: 30,
        sku: 'SHR-FRM-003',
        images: ['/images/13.png', '/images/14.png'],
        tags: ['shirt', 'formal', 'office'],
        rating: 4.6,
        numReviews: 18,
        totalSales: 64,
      },
      {
        name: 'Gym Performance Shorts',
        description: 'Lightweight, moisture-wicking gym shorts with elastic waistband and side zip pockets.',
        price: 1800,
        salePrice: 1400,
        isOnSale: true,
        category: 'Gym',
        brand: 'Athletic Wear',
        colors: ['Black', 'Navy', 'Red'],
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 55,
        sku: 'SHT-GYM-004',
        images: ['/images/35.png', '/images/36.png'],
        tags: ['shorts', 'gym', 'sportswear'],
        rating: 4.3,
        numReviews: 14,
        totalSales: 38,
      },
      {
        name: 'Party Graphic Hoodie',
        description: 'Bold graphic print heavyweight fleece hoodie — perfect for parties and streetwear looks.',
        price: 4200,
        salePrice: 4200,
        isOnSale: false,
        category: 'Party',
        brand: 'SHOP.CO',
        colors: ['Black', 'Maroon'],
        sizes: ['M', 'L', 'XL', 'XXL'],
        stock: 20,
        sku: 'HOD-PTY-005',
        images: ['/images/17.png', '/images/18.png'],
        tags: ['hoodie', 'party', 'graphic'],
        rating: 4.7,
        numReviews: 31,
        totalSales: 52,
      },
      {
        name: 'Striped Casual Shirt',
        description: 'Stylish horizontal-striped casual shirt for weekend outings. Breathable cotton blend.',
        price: 2200,
        salePrice: 2200,
        isOnSale: false,
        category: 'Casual',
        brand: 'SHOP.CO',
        colors: ['Blue/White', 'Red/White', 'Green/White'],
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 45,
        sku: 'SHR-STR-006',
        images: ['/images/30.png', '/images/31.png'],
        tags: ['shirt', 'striped', 'casual'],
        rating: 4.4,
        numReviews: 19,
        totalSales: 50,
      },
    ];

    await this.productModel.create(products);
    this.logger.log(`Seeded ${products.length} products.`);
  }

  // ── Sample guest orders ────────────────────────────────────────────────────
  async seedOrders() {
    const products = await this.productModel.find().limit(3).exec();
    if (products.length < 2) return;

    const now = new Date();
    const dateA = new Date(now); dateA.setDate(now.getDate() - 10);
    const dateB = new Date(now); dateB.setDate(now.getDate() - 3);

    await this.orderModel.create([
      {
        guestName: 'Ali Hassan',
        guestEmail: 'ali@example.com',
        items: [
          {
            product: products[0]._id,
            name: products[0].name,
            price: products[0].isOnSale ? products[0].salePrice : products[0].price,
            quantity: 2,
            color: products[0].colors?.[0] || '',
            size: products[0].sizes?.[0] || '',
            image: products[0].images?.[0] || '',
          },
        ],
        totalAmount:
          (products[0].isOnSale ? products[0].salePrice : products[0].price) * 2,
        status: OrderStatus.DELIVERED,
        shippingAddress: {
          street: 'House 12, Gulshan-e-Iqbal',
          city: 'Karachi',
          province: 'Sindh',
          postalCode: '75300',
          country: 'Pakistan',
        },
        createdAt: dateA,
      },
      {
        guestName: 'Sara Khan',
        guestEmail: 'sara@example.com',
        items: [
          {
            product: products[1]._id,
            name: products[1].name,
            price: products[1].isOnSale ? products[1].salePrice : products[1].price,
            quantity: 1,
            color: products[1].colors?.[0] || '',
            size: products[1].sizes?.[1] || '',
            image: products[1].images?.[0] || '',
          },
        ],
        totalAmount: products[1].isOnSale ? products[1].salePrice : products[1].price,
        status: OrderStatus.PROCESSING,
        shippingAddress: {
          street: 'Flat 5B, DHA Phase 6',
          city: 'Lahore',
          province: 'Punjab',
          postalCode: '54000',
          country: 'Pakistan',
        },
        createdAt: dateB,
      },
    ]);
    this.logger.log('Seeded 2 sample guest orders.');
  }

  // ── Sample notifications ───────────────────────────────────────────────────
  async seedNotifications() {
    await this.notificationModel.create([
      {
        title: '🛒 New Order — Ali Hassan',
        message: 'Order placed for Classic Cotton T-Shirt × 2 — PKR 2,400',
        type: 'order',
        isRead: false,
        link: '/admin/orders',
      },
      {
        title: '🔥 Flash Sale Active!',
        message: 'Slim Fit Denim Jeans is now on sale for PKR 2,999!',
        type: 'sale',
        isRead: false,
        link: '/shop',
      },
    ]);
  }
}
