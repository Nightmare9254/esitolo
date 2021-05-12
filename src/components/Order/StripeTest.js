import {
  CardCvcElement,
  CardElement,
  CardExpiryElement,
  CardNumberElement,
  useStripe,
} from '@stripe/react-stripe-js';
import { useElements } from '@stripe/react-stripe-js';
import { useCookies } from 'react-cookie';

const StripeTest = () => {
  const elements = useElements();
  const stripe = useStripe();

  const [cookies] = useCookies();
  const { user } = cookies;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!elements || !stripe) return;

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.log(error);
    } else {
      console.log(paymentMethod);
    }

    fetch('https://esitolo-backend.herokuapp.com/payment/instance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethod: paymentMethod,
        userData: {
          name: user.name,
          email: user.email,
          address: user.shippingAddress.city,
          phone: user.shippingAddress.phone,
        },
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
        const payload = stripe.confirmCardPayment(json.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        });
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <CardElement />
        <button type="submit" disabled={!stripe}>
          PAY
        </button>
      </form>
    </div>
  );
};

export default StripeTest;
