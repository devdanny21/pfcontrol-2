import express from 'express';
import requireAuth from '../middleware/auth.js';
import { getUserPlan } from '../middleware/planGuard.js';
import { getUserById, clearCustomBackgroundIfNeeded } from '../db/users.js';
import { getPlanCapabilitiesForPlan } from '../lib/planLimits.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.userId;
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const host = req.get('host') || req.get('x-forwarded-host') || '';
    const plan = await getUserPlan(userId, { host });
    const capabilities = getPlanCapabilitiesForPlan(plan);

    if (!capabilities.customBackgrounds) {
      await clearCustomBackgroundIfNeeded(userId);
    }

    const limits = {
      maxSessions: capabilities.maxSessions,
    };

    res.json({
      plan,
      isBasicOrAbove: plan === 'basic' || plan === 'ultimate',
      isUltimate: plan === 'ultimate',
      subscriptionStatus: user.subscription_status ?? null,
      subscriptionCurrentPeriodEnd:
        user.subscription_current_period_end ?? null,
      subscriptionCancelAtPeriodEnd:
        user.subscription_cancel_at_period_end ?? null,
      limits,
      capabilities,
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
});

export default router;

