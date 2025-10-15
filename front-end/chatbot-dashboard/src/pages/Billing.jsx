import React, { useState, useEffect } from 'react';
import { billingService } from '../services/api';

const Billing = () => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, currentRes, historyRes] = await Promise.all([
        billingService.getPlans(),
        billingService.getCurrentPlan(),
        billingService.getBillingHistory(),
      ]);
      setPlans(plansRes.data);
      setCurrentPlan(currentRes.data);
      setBillingHistory(historyRes.data);
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    setProcessingPlan(planId);
    try {
      const response = await billingService.createCheckoutSession(planId);
      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error processing subscription. Please try again.');
      setProcessingPlan(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      await billingService.cancelSubscription();
      alert('Subscription cancelled successfully.');
      fetchData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Error cancelling subscription. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan */}
      {currentPlan && (
        <div className="card mb-8 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
              <p className="text-2xl font-bold text-primary-600 mt-2">{currentPlan.name}</p>
              <p className="text-gray-600 mt-1">
                ${currentPlan.price}/{currentPlan.interval}
              </p>
              {currentPlan.expires_at && (
                <p className="text-sm text-gray-500 mt-2">
                  {currentPlan.status === 'active' ? 'Renews' : 'Expires'} on:{' '}
                  {new Date(currentPlan.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
            {currentPlan.status === 'active' && currentPlan.name !== 'Free' && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pricing Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <div
                key={plan.id}
                className={`card hover:shadow-lg transition-shadow ${
                  plan.featured ? 'ring-2 ring-primary-500 relative' : ''
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/{plan.interval}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features?.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={
                    processingPlan === plan.id ||
                    currentPlan?.plan_id === plan.id
                  }
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    plan.featured
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {processingPlan === plan.id
                    ? 'Processing...'
                    : currentPlan?.plan_id === plan.id
                    ? 'Current Plan'
                    : 'Subscribe'}
                </button>
              </div>
            ))
          ) : (
            // Default plans if API doesn't return any
            <>
              <div className="card hover:shadow-lg transition-shadow">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">$0</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">1 Chatbot</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">100 messages/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">Basic support</span>
                  </li>
                </ul>
                <button
                  disabled={currentPlan?.name === 'Free'}
                  className="w-full py-3 rounded-lg font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentPlan?.name === 'Free' ? 'Current Plan' : 'Get Started'}
                </button>
              </div>

              <div className="card hover:shadow-lg transition-shadow ring-2 ring-primary-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">$29</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">5 Chatbots</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">10,000 messages/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">Priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">Custom branding</span>
                  </li>
                </ul>
                <button className="w-full py-3 rounded-lg font-semibold bg-primary-600 text-white hover:bg-primary-700">
                  Subscribe
                </button>
              </div>

              <div className="card hover:shadow-lg transition-shadow">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">$99</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">Unlimited Chatbots</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">Unlimited messages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">24/7 support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">Advanced analytics</span>
                  </li>
                </ul>
                <button className="w-full py-3 rounded-lg font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200">
                  Subscribe
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing History</h2>
        {billingHistory && billingHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {billingHistory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      ${item.amount}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'paid' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.invoice_url && (
                        <a
                          href={item.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          View
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No billing history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;
