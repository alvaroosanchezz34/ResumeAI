const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const User = require('../auth/user.model');
const authMiddleware = require('../../middlewares/auth.middleware');

// Stripe se inicializa cuando se usa por primera vez (no al arrancar)
// así dotenv ya ha cargado las variables de entorno
let stripe;
const getStripe = () => {
    if (!stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY not set in .env');
        }
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripe;
};

// Mapeo de Price IDs de Stripe → plan interno
// ⚠️ IMPORTANTE: sustituye estos IDs por los tuyos del dashboard de Stripe
const PRICE_TO_PLAN = {
    [process.env.STRIPE_PRICE_PREMIUM]: 'premium',
    [process.env.STRIPE_PRICE_PRO]:     'pro',
};

// ── POST /stripe/checkout ────────────────────────────────────────────────────
// Crea una sesión de Stripe Checkout y devuelve la URL para redirigir al usuario
router.post('/checkout', authMiddleware, async (req, res, next) => {
    try {
        const { plan } = req.body;

        if (!['premium', 'pro'].includes(plan)) {
            return res.status(400).json({ message: 'Invalid plan' });
        }

        const priceId = plan === 'premium'
            ? process.env.STRIPE_PRICE_PREMIUM
            : process.env.STRIPE_PRICE_PRO;

        if (!priceId) {
            return res.status(500).json({ message: 'Stripe price not configured' });
        }

        const user = await User.findById(req.user.userId);

        // Crear o reutilizar customer de Stripe
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await getStripe().customers.create({
                email: user.email,
                metadata: { userId: user._id.toString() }
            });
            customerId = customer.id;
            user.stripeCustomerId = customerId;
            await user.save();
        }

        const session = await getStripe().checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.FRONTEND_URL}/dashboard?upgrade=success`,
            cancel_url:  `${process.env.FRONTEND_URL}/pricing?upgrade=cancelled`,
            metadata: { userId: user._id.toString(), plan }
        });

        res.json({ success: true, url: session.url });
    } catch (err) {
        next(err);
    }
});

// ── POST /stripe/webhook ─────────────────────────────────────────────────────
// Stripe llama a este endpoint cuando ocurre un evento (pago, cancelación, etc.)
// ⚠️ Este endpoint necesita el body RAW (no JSON), por eso lo registramos aparte en app.js
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = getStripe().webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {

            // Pago completado → activar plan
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId  = session.metadata?.userId;
                const plan    = session.metadata?.plan;

                if (userId && plan) {
                    await User.findByIdAndUpdate(userId, {
                        plan,
                        stripeSubscriptionId: session.subscription,
                        planExpiresAt: null // activo hasta cancelación
                    });
                    console.log(`✅ Plan ${plan} activado para usuario ${userId}`);
                }
                break;
            }

            // Renovación mensual exitosa
            case 'invoice.payment_succeeded': {
                const invoice        = event.data.object;
                const subscriptionId = invoice.subscription;
                const customerId     = invoice.customer;

                const user = await User.findOne({ stripeCustomerId: customerId });
                if (user) {
                    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
                    const priceId      = subscription.items.data[0]?.price?.id;
                    const plan         = PRICE_TO_PLAN[priceId];
                    if (plan) {
                        user.plan = plan;
                        user.stripeSubscriptionId = subscriptionId;
                        await user.save();
                        console.log(`🔄 Renovación ${plan} para ${user.email}`);
                    }
                }
                break;
            }

            // Cancelación o pago fallido → volver a free
            case 'customer.subscription.deleted':
            case 'invoice.payment_failed': {
                const obj        = event.data.object;
                const customerId = obj.customer;

                const user = await User.findOne({ stripeCustomerId: customerId });
                if (user) {
                    user.plan                 = 'free';
                    user.stripeSubscriptionId = null;
                    user.planExpiresAt        = null;
                    await user.save();
                    console.log(`⬇️ Plan cancelado para ${user.email}, bajado a free`);
                }
                break;
            }
        }
    } catch (err) {
        console.error('Webhook handler error:', err);
    }

    res.json({ received: true });
});

// ── GET /stripe/portal ───────────────────────────────────────────────────────
// Portal de Stripe donde el usuario puede gestionar o cancelar su suscripción
router.get('/portal', authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user.stripeCustomerId) {
            return res.status(400).json({ message: 'No active subscription' });
        }

        const session = await getStripe().billingPortal.sessions.create({
            customer:   user.stripeCustomerId,
            return_url: `${process.env.FRONTEND_URL}/dashboard`,
        });

        res.json({ success: true, url: session.url });
    } catch (err) {
        next(err);
    }
});

module.exports = router;