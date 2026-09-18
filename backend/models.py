from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    financial_profile = relationship(
        "FinancialProfile",
        back_populates="user",
        uselist=False
    )

    score_history = relationship(
        "ScoreHistory",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    loans = relationship(
        "Loan",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    monthly_income = Column(Float, nullable=False)
    monthly_debt = Column(Float, nullable=False)
    credit_limit = Column(Float, nullable=False)
    credit_used = Column(Float, nullable=False)
    current_cibil_score = Column(Integer, nullable=False)

    user = relationship(
        "User",
        back_populates="financial_profile"
    )


class ScoreHistory(Base):
    __tablename__ = "score_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    score = Column(Integer, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship(
        "User",
        back_populates="score_history"
    )


class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    loan_type = Column(
        String,
        nullable=False
    )

    loan_amount = Column(
        Float,
        nullable=False
    )

    monthly_emi = Column(
        Float,
        nullable=False
    )

    missed_payments = Column(
        Integer,
        default=0,
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="loans"
    )