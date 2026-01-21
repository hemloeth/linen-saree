"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  // Contact & Account
  {
    category: "Contact & Account",
    question: "How do I contact linensaree.com?",
    answer: "You may call/WhatsApp us at +91 92641-51111 from Monday to Saturday [10:00 am to 6:30 pm]. Or drop us an email at linensaree001@gmail.com, our team will be happy to assist you. You may also subscribe to our newsletters through our website www.linensaree.com and follow us on Facebook, Instagram, and more, to know about our Launches, New Arrivals, Offers & much more…"
  },
  {
    category: "Contact & Account",
    question: "Can I have an account with you?",
    answer: "Yes! you may create an account with us through the Login Icon, simply by entering a few details on our website and accessing all information related to your orders."
  },
  {
    category: "Contact & Account",
    question: "I forgot my password, how do I reset it?",
    answer: "To reset your password, please click on the \"Forgot Password\" option available on the Account/Login page. Enter the email address, and the link to set a new password will be mailed to your registered Email ID."
  },

  // Products & Orders
  {
    category: "Products & Orders",
    question: "What all products are available on linensaree.com?",
    answer: "linensaree.com is your luxury destination for the most Exclusive and Curated collection of Handloom/Handcrafted/Handwoven Sarees, Dupattas, Customized Designer Blouses, Premium Stoles, Ethnic Wear, and Kurtis."
  },
  {
    category: "Products & Orders",
    question: "How do I place an order with linensaree.com?",
    answer: "Select the products you would like to order placing them in the cart through the 'add to cart' option. Once all are added, click on 'proceed to checkout'. Fill in your shipping details, and payment details and complete the order."
  },
  {
    category: "Products & Orders",
    question: "What payment options do I get?",
    answer: "For Indian shipping addresses, we have Cash on delivery as well as Prepayment options. For International orders, we have Prepayment options. We have multiple payment gateways for you."
  },
  {
    category: "Products & Orders",
    question: "How will I get order information?",
    answer: "Once the order is placed you shall receive an email confirmation along with the invoice on your registered email id. For all communications, we use your registered email address."
  },
  {
    category: "Products & Orders",
    question: "How many days does the shipping of orders take?",
    answer: "(1 to 5 days) The dispatch time will depend on the Saree you order. As our Sarees are completely Handloom/Handcrafted/Handwoven and in many cases made to order, we do mention the timeline for dispatch for each of our Sarees. Kindly refer to the product details on our website for dispatch-related information or reach out to us at +91 92641-51111."
  },
  {
    category: "Products & Orders",
    question: "How do I track my order?",
    answer: "Before dispatching the orders, our team confirms the same, and post-dispatch of the order, share the tracking details on your email address provided. You may track the order with the tracking details shared."
  },
  {
    category: "Products & Orders",
    question: "Can I add more items to the existing order?",
    answer: "No, you may not be able to add items to the existing order. You will need to place a new order for more items you would want to order."
  },
  {
    category: "Products & Orders",
    question: "Can I replace the items in the existing order?",
    answer: "Yes, if the product price, you want to order is the same as the existing order value. However, if the items have different prices, then a new order will need to be placed. In the above cases, kindly reach out to customer care for the process before the dispatch of the existing order takes place."
  },
  {
    category: "Products & Orders",
    question: "How do I change my shipping details?",
    answer: "Kindly reach out to us at +91 92641-51111  immediately, before the dispatch of the order, for making changes to the shipping details. Once the order is dispatched, changes cannot be made to the shipping details."
  },
  {
    category: "Products & Orders",
    question: "How do I cancel my order?",
    answer: "For cancelling the order, kindly reach out to our customer care number or email us immediately before the dispatch of the order. Once the order is dispatched order cancellation is not possible. And in case of cancellation of prepaid orders, Rs 150.00 INR will be deducted irrespective of the order status."
  },
  {
    category: "Products & Orders",
    question: "I am facing an issue placing the order/Can I place an order through the phone?",
    answer: "You may call/WhatsApp us at +91 92641-51111 and our dedicated team will assist you with the various options for placing the order with linensaree.com"
  },

  // Shipping
  {
    category: "Shipping",
    question: "Are there any shipping charges?",
    answer: "Yes, for Indian shipping addresses: For Cash on delivery orders, Rs 100.00 INR. For Prepaid orders, free shipping is available. For International orders, shipping charges will apply as per the country in which the order needs shipping."
  },
  {
    category: "Shipping",
    question: "How does the delivery process work?",
    answer: "We deliver the products through reputed third-party courier services. You may easily track the order via the tracking details shared. Once the parcel reaches the destination local office, the courier company intimates you of the delivery schedule when the parcel is set out for delivery. A maximum of three delivery attempts are made by the courier company post which the parcels will come to return to us."
  },
  {
    category: "Shipping",
    question: "What if I miss the delivery?",
    answer: "You may have the option of scheduling the delivery at your convenience by visiting the website of the dedicated shipping company. Still, if you miss the delivery, contact customer care when the first attempt for delivery is made by the courier person, for us to arrange the delivery accordingly or reship the parcel in case the parcel was returned to us."
  },
  {
    category: "Shipping",
    question: "Is a cash-on-delivery option available at my location?",
    answer: "We have cash on delivery service available for an Indian shipping address. However, there may be some pin codes or remote areas where the COD option is not available. In such case, you may check with our customer service who will provide you with information and help you to make a prepayment."
  },

  // Returns & Exchanges
  {
    category: "Returns & Exchanges",
    question: "Can we return/exchange or get a refund on the order?",
    answer: "Yes, we do have a return policy. You may raise your return request on support@linensaree.com mentioning the Order number, reason, and whether you need an exchange or refund. Our team shall check the eligibility as per the terms and conditions mentioned in our return policy https://www.linensaree.com/pages/return-policy and accordingly process your request."
  },
  {
    category: "Returns & Exchanges",
    question: "How is the return processed?",
    answer: "Once the return request is accepted, we shall arrange the return pick up, the courier person will collect the parcel from your doorstep within 3 days and it takes approx. 7 working days for the returned parcel to reach us. Once the return parcel is received, the exchange/refund is processed, and post successful quality check of the product."
  },
  {
    category: "Returns & Exchanges",
    question: "When shall I get exchanged product?",
    answer: "On receipt of the returned parcel, a quality check is done. Post successful quality check, the product requested in exchange is dispatched, post confirmation from you, as per the dispatch timeline."
  },
  {
    category: "Returns & Exchanges",
    question: "When shall I get the refund?",
    answer: "Post receipt of the returned product and successful quality check, a refund is done within the timeline of 7 working days from the date of receipt of returned product. Once a refund is done, our team will share the screenshot of the same via registered WhatsApp or email id."
  },
  {
    category: "Returns & Exchanges",
    question: "How will the refund be done?",
    answer: "Refund shall be done via Bank transfer in case of cash on the delivery order. In the case of prepaid orders, the amount of the refund is reversed to the same account from which payment is made."
  },
  {
    category: "Returns & Exchanges",
    question: "Can I cancel the return request if I want to retain the product?",
    answer: "Yes, you may certainly retain the product by notifying us via email at support@linensaree.com"
  },
  {
    category: "Returns & Exchanges",
    question: "Is there a return policy for International orders?",
    answer: "No, return/refund/exchange is not applicable on International orders [Orders having International Shipping Address]"
  },
  {
    category: "Returns & Exchanges",
    question: "Is there a return on Ethnics, Blouses, Jewellery, and stoles?",
    answer: "No, as the blouses are completely customized, return does not apply to them. Also, on Jewellery, Stoles & Dupatta return/refund/exchange is not applicable. In the case of Ethnics, a return is not applicable, however, if the size is not fit, we may exchange the same."
  },

  // General
  {
    category: "General",
    question: "Do we get discounts on products?",
    answer: "Yes, we do have offers running as per Seasons and festivals. Please follow us on Facebook, and Instagram for the Coupon code running."
  },
  {
    category: "General",
    question: "How do I place an order other than on the website?",
    answer: "You may contact us on WhatsApp, email, FB messenger, and Instagram. Our team shall help you with placing the order."
  },
  {
    category: "General",
    question: "Does Linen Saree take bulk orders?",
    answer: "Yes, we do. Kindly email us the details of your requirements at support@linensaree.com or connect with us at +91 92641-51111"
  },
  {
    category: "General",
    question: "How do I send linensaree.com products as a gift to dear ones?",
    answer: "You may contact us at +91 92641-51111 and give us details. We shall send the product with customized details as provided by you."
  },
  {
    category: "General",
    question: "What if I still have queries?",
    answer: "You may certainly read our policies on the website or reach out to us through… Call or WhatsApp: +91 92641-51111, Email id: support@linensaree.com, Facebook Messenger: https://www.facebook.com/Linensareecom-260110851539434, Instagram: https://www.instagram.com/_linensaree/. Our team will be happy to assist. Happy shopping with www.linensaree.com"
  }
]

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="border border-border rounded-lg">
        <div className="w-full px-6 py-4 text-left flex items-center justify-between">
          <h3 className="font-sans font-medium text-foreground pr-4">
            {item.question}
          </h3>
          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg">
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-sans font-medium text-foreground pr-4">
          {item.question}
        </h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="font-sans text-muted-foreground leading-relaxed whitespace-pre-line">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const categories = ["All", ...Array.from(new Set(faqData.map(item => item.category)))]
  
  const filteredFAQs = selectedCategory === "All" 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory)

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-muted/50 to-background pt-[120px] lg:pt-[140px]">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 lg:py-32">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-serif text-4xl lg:text-6xl font-light mb-6">
                Frequently Asked Questions
              </h1>
              <p className="font-sans text-lg lg:text-xl text-muted-foreground leading-relaxed">
                Find answers to common questions about our products, orders, and services
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted/30 rounded-lg"></div>
            ))}
          </div>
        </div>
        
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-muted/50 to-background pt-[120px] lg:pt-[140px]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-light mb-6">
              Frequently Asked Questions
            </h1>
            <p className="font-sans text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Find answers to common questions about our products, orders, and services
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((item, index) => (
            <FAQAccordion key={index} item={item} />
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 lg:mt-24 bg-muted/30 rounded-2xl p-8 lg:p-12 text-center">
          <h2 className="font-serif text-2xl lg:text-3xl font-light mb-6">
            Still have questions?
          </h2>
          <p className="font-sans text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our customer support team is here to help you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="tel:+91 92641-51111"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Call/WhatsApp: +91 92641-51111
            </a>
            <a
              href="mailto:support@linensaree.com"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              Email: support@linensaree.com
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}