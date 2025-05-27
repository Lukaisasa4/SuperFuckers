from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Location(Base):
    __tablename__ = 'locations'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    weather_data = relationship("Weather", back_populates="location")

class Weather(Base):
    __tablename__ = 'weather'

    id = Column(Integer, primary_key=True)
    date = Column(Date)
    temperature = Column(Float)
    condition = Column(String(255))
    location_id = Column(Integer, ForeignKey('locations.id'))

    location = relationship("Location", back_populates="weather_data")