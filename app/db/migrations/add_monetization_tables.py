"""
Database migration to add monetization tables
"""
from sqlalchemy import text
from app.db.database import engine

def migrate():
    """Add monetization tables to the database"""
    
    with engine.connect() as conn:
        # Create subscriptions table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'active',
                current_period_start DATETIME NOT NULL,
                current_period_end DATETIME NOT NULL,
                cancel_at_period_end BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """))
        
        # Create purchases table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                buyer_id INTEGER NOT NULL,
                seller_id INTEGER NOT NULL,
                item_type VARCHAR(50) NOT NULL,
                item_id INTEGER NOT NULL,
                amount_cents INTEGER NOT NULL,
                platform_fee_cents INTEGER NOT NULL,
                seller_earnings_cents INTEGER NOT NULL,
                stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
                status VARCHAR(50) DEFAULT 'completed',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (buyer_id) REFERENCES users (id),
                FOREIGN KEY (seller_id) REFERENCES users (id)
            )
        """))
        
        # Add monetization columns to users table
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255)"))
        except:
            pass  # Column might already exist
        
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN has_active_subscription BOOLEAN DEFAULT FALSE"))
        except:
            pass  # Column might already exist
        
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN first_post_used BOOLEAN DEFAULT FALSE"))
        except:
            pass  # Column might already exist
        
        # Update recipes table to use price_cents instead of price
        try:
            conn.execute(text("ALTER TABLE recipes ADD COLUMN price_cents INTEGER"))
            conn.execute(text("ALTER TABLE recipes ADD COLUMN is_premium BOOLEAN DEFAULT FALSE"))
        except:
            pass  # Columns might already exist
        
        # Update bakes table to use price_cents instead of price
        try:
            conn.execute(text("ALTER TABLE bakes ADD COLUMN price_cents INTEGER"))
        except:
            pass  # Column might already exist
        
        # Create indexes for better performance
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON purchases(buyer_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_purchases_seller_id ON purchases(seller_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_purchases_item ON purchases(item_type, item_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id)"))
        
        conn.commit()
    
    print("✅ Monetization tables migration completed successfully!")

if __name__ == "__main__":
    migrate()
