"""
Comprehensive database migration to create all tables for xFood platform
"""
from sqlalchemy import text
from app.db.database import engine

def migrate():
    """Create all tables for the xFood platform"""
    
    with engine.connect() as conn:
        # Create users table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email VARCHAR(255) UNIQUE NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                avatar_url VARCHAR(500),
                location VARCHAR(255),
                bio TEXT,
                rating FLOAT DEFAULT 0.0,
                review_count INTEGER DEFAULT 0,
                is_verified BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                role VARCHAR(50) DEFAULT 'user',
                dietary_preferences TEXT,
                join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                stripe_customer_id VARCHAR(255),
                has_active_subscription BOOLEAN DEFAULT FALSE,
                first_post_used BOOLEAN DEFAULT FALSE
            )
        """))
        
        # Create recipes table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS recipes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                image_url VARCHAR(500),
                ingredients TEXT NOT NULL,
                instructions TEXT NOT NULL,
                prep_time INTEGER,
                cook_time INTEGER,
                servings INTEGER,
                difficulty VARCHAR(50) DEFAULT 'medium',
                category VARCHAR(100) NOT NULL,
                tags TEXT,
                is_premium BOOLEAN DEFAULT FALSE,
                price_cents INTEGER,
                rating FLOAT DEFAULT 0.0,
                review_count INTEGER DEFAULT 0,
                created_by INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users (id)
            )
        """))
        
        # Create bakes table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS bakes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                image_url VARCHAR(500),
                category VARCHAR(100) NOT NULL,
                tags TEXT,
                allergens TEXT,
                price_cents INTEGER NOT NULL,
                available_for_order BOOLEAN DEFAULT TRUE,
                pickup_location VARCHAR(255),
                full_address TEXT,
                phone_number VARCHAR(20),
                circle_id INTEGER,
                rating FLOAT DEFAULT 0.0,
                review_count INTEGER DEFAULT 0,
                created_by INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users (id),
                FOREIGN KEY (circle_id) REFERENCES circles (id)
            )
        """))
        
        # Create circles table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS circles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                image_url VARCHAR(500),
                is_private BOOLEAN DEFAULT FALSE,
                max_members INTEGER,
                created_by INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users (id)
            )
        """))
        
        # Create reviews table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                recipe_id INTEGER,
                bake_id INTEGER,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (recipe_id) REFERENCES recipes (id),
                FOREIGN KEY (bake_id) REFERENCES bakes (id)
            )
        """))
        
        # Create comments table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                recipe_id INTEGER,
                bake_id INTEGER,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (recipe_id) REFERENCES recipes (id),
                FOREIGN KEY (bake_id) REFERENCES bakes (id)
            )
        """))
        
        # Create likes table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS likes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                recipe_id INTEGER,
                bake_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (recipe_id) REFERENCES recipes (id),
                FOREIGN KEY (bake_id) REFERENCES bakes (id)
            )
        """))
        
        # Create messages table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER NOT NULL,
                receiver_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users (id),
                FOREIGN KEY (receiver_id) REFERENCES users (id)
            )
        """))
        
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
        
        # Create indexes for better performance
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_recipes_created_by ON recipes(created_by)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_bakes_created_by ON bakes(created_by)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_bakes_category ON bakes(category)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_circles_created_by ON circles(created_by)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_reviews_recipe_id ON reviews(recipe_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_reviews_bake_id ON reviews(bake_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_comments_recipe_id ON comments(recipe_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_comments_bake_id ON comments(bake_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_likes_recipe_id ON likes(recipe_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_likes_bake_id ON likes(bake_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON purchases(buyer_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_purchases_seller_id ON purchases(seller_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_purchases_item ON purchases(item_type, item_id)"))
        
        conn.commit()
    
    print("✅ All tables created successfully!")

if __name__ == "__main__":
    migrate()
