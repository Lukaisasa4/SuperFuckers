from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

#Define la tabla llamada locations.
class Location(Base):
    __tablename__ = 'locations'

      #Clave primaria de la tabla, 
      #nombre del lugar, debe ser único y no puede ser nulo,
      #latitud y longitud del lugar, 
      #Relación uno-a-muchos con la tabla weather. 
      #Un Location puede tener muchos registros de clima (Weather).
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    weather_data = relationship("Weather", back_populates="location")

#Define la tabla llamada weather

class Weather(Base):
    __tablename__ = 'weather'

    #Clave primaria de la tabla, 
    #fecha del registro de clima,
    #temperatura registrada,
    #condición meteorológica (como "soleado", "lluvioso", etc.),
    #clave foránea que referencia a la tabla locations,
    #Relación muchos-a-uno con la tabla Location.
    #Un Weather pertenece a un Location específico.


    id = Column(Integer, primary_key=True)
    date = Column(Date)
    temperature = Column(Float)
    condition = Column(String(255))
    location_id = Column(Integer, ForeignKey('locations.id'))

    location = relationship("Location", back_populates="weather_data")