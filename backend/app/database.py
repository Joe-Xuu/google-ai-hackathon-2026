from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from app.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Auto-migrate SQLite schema if old DB exists
        migrations = [
            "ALTER TABLE players ADD COLUMN avatar_url VARCHAR DEFAULT 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Hero';",
            "ALTER TABLE quests ADD COLUMN tier VARCHAR DEFAULT 'daily';",
            "ALTER TABLE quests ADD COLUMN week_number INTEGER;",
            "ALTER TABLE quests ADD COLUMN scheduled_date VARCHAR;",
            "ALTER TABLE quests ADD COLUMN completed_at VARCHAR;",
            "ALTER TABLE items ADD COLUMN created_at DATETIME;"
        ]
        for sql in migrations:
            try:
                await conn.execute(text(sql))
            except Exception:
                pass # Column already exists
