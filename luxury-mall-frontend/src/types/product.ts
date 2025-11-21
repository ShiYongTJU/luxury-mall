export interface ProductSpecOption {
  id: string
  label: string
  subLabel?: string
}

export interface ProductSpec {
  id: string
  name: string
  options: ProductSpecOption[]
}

export interface ProductReview {
  id: string
  user: string
  avatar: string
  rating: number
  comment: string
  date: string
  specSummary?: string
}

export interface Product {
  id: string
  name: string
  description?: string
  image: string
  price: number
  originalPrice?: number
  tag?: string
  category?: string
  subCategory?: string
  brand?: string
  images?: string[]
  detailDescription?: string
  highlights?: string[]
  specs?: ProductSpec[]
  reviews?: ProductReview[]
  services?: string[]
  shippingInfo?: string
  stock?: number
}

export interface CarouselItem {
  id: string
  image: string
  title?: string
  link?: string
}

export interface PageComponent {
  type: 'carousel' | 'seckill' | 'groupbuy' | 'productList' | 'guessYouLike'
  id: string
  config: {
    title?: string
    [key: string]: any
  }
  data: any
}

export interface HomePageData {
  components: PageComponent[]
}

export interface SubCategory {
  id: string
  name: string
  products: Product[]
}

export interface Category {
  id: string
  name: string
  icon: string
  subCategories: SubCategory[]
}



