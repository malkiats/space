import asyncio

from app.db.base_all import Base
from app.db.session import engine


async def main() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print("Database tables created successfully")


if __name__ == "__main__":
    asyncio.run(main())