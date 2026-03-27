from app.account.models import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


async def create_user(session: AsyncSession, name: str, email: str) -> User:
    user = User(name=name, email=email)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user

async def get_all_users(session: AsyncSession) -> list[User]:
    stmt = select(User)
    result = await session.execute(stmt)
    return result.scalars().all()