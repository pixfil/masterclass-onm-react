'use client'

import { Checkbox, CheckboxField, CheckboxGroup } from '@/shared/Checkbox'
import { Description, Label } from '@/shared/fieldset'
import { PropertyType } from '@/type'
import { FC, useState } from 'react'

const defaultPropertyTypes: PropertyType[] = [
  {
    name: 'Maison',
    value: 'maison',
    description: 'Maison individuelle avec jardin',
  },
  {
    name: 'Appartement',
    value: 'appartement',
    description: 'Appartement en immeuble collectif',
  },
  {
    name: 'Locaux commerciaux',
    value: 'locaux_commerciaux',
    description: 'Bureaux, commerces, entrepôts',
  },
  {
    name: 'Parking',
    value: 'parking',
    description: 'Place de parking ou garage',
  },
  {
    name: 'Terrain',
    value: 'terrain',
    description: 'Terrain constructible ou non',
  },
  {
    name: 'Autres',
    value: 'autres',
    description: 'Autres types de biens',
  },
]

interface Props {
  onChange?: (data: string[]) => void
  propertyTypes?: PropertyType[]
}

const PropertyTypeSelect: FC<Props> = ({ onChange, propertyTypes = defaultPropertyTypes }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([propertyTypes[0].name])

  return (
    <>
      <h3 className="block text-xl font-semibold sm:text-2xl">Type de bien</h3>
      <CheckboxGroup className="mt-7">
        {propertyTypes.map((item) => (
          <CheckboxField key={item.value}>
            <Checkbox
              name="property_type"
              value={item.value}
              checked={selectedTypes.includes(item.name)}
              onChange={(e) => {
                const newState = e ? [...selectedTypes, item.name] : selectedTypes.filter((type) => type !== item.name)
                setSelectedTypes(newState)
                if (onChange) {
                  onChange(newState)
                }
              }}
            />
            <Label>{item.name}</Label>
            <Description>{item.description}</Description>
          </CheckboxField>
        ))}
      </CheckboxGroup>
    </>
  )
}

export default PropertyTypeSelect
