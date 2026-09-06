import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CurrencyService {
  private exchangeRates: Record<string, number> = {
    EGP: 1,
    USD: 0.032,
  };

  constructor(private prisma: PrismaService) {}

  async getCurrencyConfig(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { currency: true },
    });
    if (!org) throw new NotFoundException("Organization not found");

    return {
      currency: org.currency,
      exchangeRates: this.exchangeRates,
    };
  }

  async convertAmount(
    amount: number,
    from: string,
    to: string,
  ): Promise<number> {
    if (!this.exchangeRates[from] || !this.exchangeRates[to]) {
      throw new Error("Unsupported currency");
    }
    const baseAmount = amount / this.exchangeRates[from];
    return baseAmount * this.exchangeRates[to];
  }

  formatMoney(amount: number, currency: string): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  }
}
