import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  items: [{
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    foodName: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: Number
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'rejected'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['placed', 'accepted', 'completed'],
    default: 'placed'
  }
}, {
  timestamps: true
});

// Generate sequential order ID
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderId) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `FF-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
