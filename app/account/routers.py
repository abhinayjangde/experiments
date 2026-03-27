from fastapi import APIRouter, Depends
from app.account.services import create_user, get_all_users
from app.db.config import SessionDep


router = APIRouter(prefix="/account", tags=["account"])

@router.post("/create")
async def create_account(session: SessionDep, name: str, email: str):

    return await create_user(session, name, email)

@router.get("/users")
async def list_users(session: SessionDep):
    return await get_all_users(session)