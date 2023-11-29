import { ArrowPathIcon, CloudArrowUpIcon, FingerPrintIcon, LockClosedIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Personalized Learning Plan',
    description:
      'We assess your current skill level and create a tailored learning plan. This ensures you focus on areas that need improvement.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Expert Guidance',
    description:
      'Our consultants are experienced programmers who can guide you through complex topics and help you avoid common pitfalls.',
    icon: LockClosedIcon,
  },
  {
    name: 'Code Review',
    description:
      'Submit your code and receive detailed feedback from our consultants. We help you write clean, efficient, and maintainable code.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Secure Learning Environment',
    description:
      'Our platform is safe and secure. You can focus on learning while we take care of the rest.',
    icon: FingerPrintIcon,
  }
]

export default function Features() {
  return (
    <div className="bg-white py-24 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-green-600">Learn faster</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to learn programming fast
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            We are well known for our 1-on-1 consulting service. We will help you learn programming faster than you can imagine.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
