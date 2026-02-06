const express = require('express');
const router = express.Router();

// Simple heuristic recommendations that mirror frontend logic
router.post('/', async (req, res) => {
  try {
    const { content = '', mood = 3, emotions = [], sentiment = { label: 'neutral' } } = req.body || {};

    const emoSet = new Set(emotions);
    const label = sentiment.label;
    const recs = [];

    if (emoSet.has('anxious') || emoSet.has('angry') || label === 'negative' || mood <= 2) {
      recs.push(
        {
          type: 'yoga',
          id: 'child_pose',
          name: "Child's Pose (Balasana)",
          reason: 'Helps reduce stress and calm the nervous system.',
        },
        {
          type: 'mudra',
          id: 'gyan_mudra',
          name: 'Gyan Mudra',
          reason: 'Supports focus and reduces anxiety.',
        }
      );
    }

    if (emoSet.has('sad') || mood <= 3) {
      recs.push(
        {
          type: 'yoga',
          id: 'cat_cow',
          name: 'Cat-Cow Stretch',
          reason: 'Gently mobilizes the spine and improves energy flow.',
        },
        {
          type: 'mudra',
          id: 'prana_mudra',
          name: 'Prana Mudra',
          reason: 'Helps increase vitality and reduce fatigue.',
        }
      );
    }

    if (emoSet.has('calm') || emoSet.has('grateful') || emoSet.has('hopeful') || label === 'neutral') {
      recs.push(
        {
          type: 'yoga',
          id: 'mountain_pose',
          name: 'Mountain Pose (Tadasana)',
          reason: 'Builds grounding and body awareness.',
        },
        {
          type: 'mudra',
          id: 'apan_mudra',
          name: 'Apan Mudra',
          reason: 'Supports emotional clarity and detoxification.',
        }
      );
    }

    if (emoSet.has('happy') || label === 'positive' || mood >= 4) {
      recs.push(
        {
          type: 'yoga',
          id: 'savasana',
          name: 'Corpse Pose (Savasana)',
          reason: 'Helps integrate positive experiences and rest the mind.',
        },
        {
          type: 'practice',
          id: 'gratitude_journaling',
          name: 'Gratitude Journaling',
          reason: 'Reinforces positive emotions and resilience.',
        }
      );
    }

    const unique = [];
    const seen = new Set();
    for (const r of recs) {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        unique.push(r);
      }
    }

    res.json({ recommendations: unique });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

module.exports = router;


