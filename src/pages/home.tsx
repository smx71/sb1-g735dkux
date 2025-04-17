import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomePage() {
  const { user } = useAuth();

  return (
    <>
      {/* About Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl font-black text-wilpf-primary mb-6">
              About WILPF
            </h1>
            <p className="text-xl text-wilpf-gray-600">
              WILPF has been working since 1915 to unite women worldwide who oppose oppression and exploitation. We work for peace, justice and international disarmament.
            </p>
          </div>

          {/* Mission Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-wilpf-sky/10 border-none">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-wilpf-primary mb-4">Our Vision</h3>
                <p className="text-wilpf-gray-600">
                  A world free from violence and armed conflict with social, economic and political justice, and equal rights for all.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-wilpf-sage/10 border-none">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-wilpf-primary mb-4">Our Mission</h3>
                <p className="text-wilpf-gray-600">
                  To gather women from around the world who oppose war, violence, exploitation and all forms of discrimination.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-wilpf-lavender/10 border-none">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-wilpf-primary mb-4">Our Impact</h3>
                <p className="text-wilpf-gray-600">
                  Over 100 years of feminist peace activism, bringing women's voices to the forefront of peace and security.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Key Areas */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-wilpf-primary mb-8 text-center">
              Key Focus Areas
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-wilpf-coral/10 flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-wilpf-coral" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-wilpf-primary mb-2">Feminist Peace</h3>
                    <p className="text-wilpf-gray-600">
                      Promoting feminist perspectives on peace, security, and disarmament.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-wilpf-sage/10 flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-wilpf-sage" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-wilpf-primary mb-2">Social Justice</h3>
                    <p className="text-wilpf-gray-600">
                      Working towards economic and social justice for all.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-wilpf-sky/10 flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-wilpf-sky" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-wilpf-primary mb-2">Environmental Justice</h3>
                    <p className="text-wilpf-gray-600">
                      Advocating for environmental protection and climate justice.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-wilpf-lavender/10 flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-wilpf-lavender" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-wilpf-primary mb-2">Human Rights</h3>
                    <p className="text-wilpf-gray-600">
                      Defending human rights and promoting gender equality.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-wilpf-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join the Movement for Peace
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Become part of the oldest women's peace organization and help us build a world of peace and freedom.
          </p>
          <div className="flex justify-center gap-4">
            {user ? (
              <Button
                size="lg"
                className="bg-white text-wilpf-primary hover:bg-wilpf-coral hover:text-white"
                asChild
              >
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button
                size="lg"
                className="bg-white text-wilpf-primary hover:bg-wilpf-coral hover:text-white"
              >
                Become a Member
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-wilpf-primary"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}