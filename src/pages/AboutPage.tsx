import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-24 pt-32">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">About Kacha Bazar</h1>
        
        <div className="mb-12 relative rounded-lg overflow-hidden">
          <img 
            src="https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1600" 
            alt="Organic vegetables" 
            className="w-full h-80 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h2 className="text-white text-3xl font-bold">Fresh & Organic</h2>
          </div>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <h2>Our Story</h2>
          <p>
            Kacha Bazar started with a simple idea: to make fresh, organic produce accessible to everyone. 
            What began as a small farmer's market stall has grown into a thriving online marketplace 
            connecting local farmers directly with consumers who care about quality, sustainability, 
            and supporting local communities.
          </p>
          
          <h2>Our Mission</h2>
          <p>
            At Kacha Bazar, our mission is to revolutionize the way people shop for groceries by 
            providing a seamless online platform that delivers farm-fresh products directly to your doorstep. 
            We believe in:
          </p>
          
          <ul>
            <li><strong>Quality:</strong> Offering only the freshest, highest-quality produce</li>
            <li><strong>Sustainability:</strong> Supporting eco-friendly farming practices</li>
            <li><strong>Community:</strong> Building relationships between farmers and consumers</li>
            <li><strong>Transparency:</strong> Providing clear information about product origins</li>
          </ul>
          
          <h2>Our Products</h2>
          <p>
            We carefully curate our selection of products, working directly with local farmers and 
            artisanal producers who share our values. From seasonal fruits and vegetables to dairy, 
            meats, and pantry staples, every item in our inventory is selected for its quality, 
            freshness, and sustainability credentials.
          </p>
          
          <h2>Join Our Community</h2>
          <p>
            When you shop with Kacha Bazar, you're not just a customer – you're part of a community 
            that values healthy living, environmental responsibility, and supporting local agriculture. 
            We invite you to join us in our mission to make fresh, organic food accessible to all.
          </p>
        </div>
        
        <div className="mt-12 text-center">
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link to="/products">Shop Our Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}