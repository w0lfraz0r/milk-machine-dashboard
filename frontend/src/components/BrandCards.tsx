import React from 'react'
import { BRAND_CARDS_LABELS, BRAND_PACKET_SIZES } from '../constants/labels'
import BrandCard from './BrandCard'

const brandCardPropsList = [
  {
    title: BRAND_CARDS_LABELS.tonedMilk,
    imageUrl: '/src/assets/shubham.svg',
    keys: BRAND_PACKET_SIZES.tonedMilk,
    data: { one: 1800, half: 2500, six: 500, small: 200 },
    linkUrl: 'https://www.mydairy.in/products/toned-milk',
  },
  {
    title: BRAND_CARDS_LABELS.shubham,
    imageUrl: '/src/assets/shubham2.webp',
    keys: BRAND_PACKET_SIZES.shubham,
    data: { one: 1200, half: 2100 },
  },
  {
    title: BRAND_CARDS_LABELS.nandiniSpecial,
    imageUrl: '/src/assets/shubham.svg',
    keys: BRAND_PACKET_SIZES.nandiniSpecial,
    data: { one: 900, half: 1700 },
  },
  {
    title: BRAND_CARDS_LABELS.homogenisedCow,
    imageUrl: '/src/assets/shubham2.webp',
    keys: BRAND_PACKET_SIZES.homogenisedCow,
    data: { half: 800 },
  },
  {
    title: BRAND_CARDS_LABELS.smrudhi,
    imageUrl: '/src/assets/shubham.svg',
    keys: BRAND_PACKET_SIZES.smrudhi,
    data: { half: 600 },
  },
  {
    title: BRAND_CARDS_LABELS.desiCow,
    imageUrl: '/src/assets/shubham2.webp',
    keys: BRAND_PACKET_SIZES.desiCow,
    data: { half: 400 },
  },
]

function BrandCards() {
  return (
    <div className="grid grid-cols-3 gap-6 w-full max-w-8xl mx-auto mt-0">
      {brandCardPropsList.map((props) => (
        <BrandCard key={props.title} {...props} />
      ))}
    </div>
  )
}

export default BrandCards