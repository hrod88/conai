import { requireAdmin } from "@/lib/admin-guard";
import { aeCall } from "@/lib/aliexpress";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const q = req.nextUrl.searchParams.get("q") ?? "smart";
  const page = req.nextUrl.searchParams.get("page") ?? "1";
  const probe = req.nextUrl.searchParams.get("probe");

  // Probe product: prueba ds.product.get con un product_id real + access_token
  if (probe === "product") {
    const accessToken = process.env.AE_ACCESS_TOKEN ?? "";
    const data = await aeCall("aliexpress.ds.product.get", {
      product_id: req.nextUrl.searchParams.get("id") ?? "1005010167316120",
      ship_to_country: "CL",
      target_currency: "USD",
      target_language: "EN",
      ...(accessToken ? { access_token: accessToken } : {}),
    });
    return Response.json(data);
  }

  // Probe ds-search: prueba aliexpress.ds.text.search.product con params correctos
  if (probe === "ds-search") {
    const results: Record<string, unknown> = {};

    results["text_search"] = await aeCall("aliexpress.ds.text.search.product", {
      product_sug: "smart gadget",
      sort: "SALE_PRICE_ASC",
      page_no: "1",
      page_size: "5",
      target_currency: "USD",
      target_language: "EN",
      ship_to_country: "CL",
    });

    results["category_list"] = await aeCall("aliexpress.ds.category.get.list", {
      parent_category_id: "0",
    });

    results["recommend_feed"] = await aeCall("aliexpress.ds.recommend.feed.get", {
      feed_name: "BEST_SELLER",
      country: "CL",
      language: "es",
      currency: "USD",
      page_no: "1",
      page_size: "5",
    });

    return Response.json(results);
  }

  // Probe raw: devuelve datos crudos del primer feed para ver estructura
  if (probe === "raw") {
    const data = await aeCall("aliexpress.ds.recommend.feed.get", {
      feed_name: "BEST_SELLER",
      country: "CL",
      language: "es",
      currency: "CLP",
      page_no: "1",
      page_size: "3",
    });
    return Response.json(data);
  }

  // Probe feed: prueba valores de feed_name en aliexpress.ds.recommend.feed.get
  if (probe === "feed") {
    const feedNames = [
      "CUSTOMIZED_FOR_BUYER",
      "BEST_SELLER",
      "RECOMMENDED",
      "NEW_ARRIVAL",
      "DISCOUNT",
      "TOP_SELLING",
      "MOST_POPULAR",
      "HOT_PRODUCTS",
    ];
    const results: Record<string, unknown> = {};
    for (const feed_name of feedNames) {
      try {
        const data = await aeCall("aliexpress.ds.recommend.feed.get", {
          feed_name,
          country: "CL",
          language: "es",
          currency: "CLP",
          page_no: "1",
          page_size: "5",
        });
        const str = JSON.stringify(data);
        results[feed_name] = str.includes("error_response") ? JSON.parse(str).error_response?.code : "OK";
      } catch (err) {
        results[feed_name] = String(err);
      }
    }
    return Response.json(results);
  }

  // Probe métodos DS adicionales
  if (probe === "ping") {
    const methods = [
      "aliexpress.ds.product.get",
      "aliexpress.ds.image.search.product",
      "aliexpress.ds.text.search.product",
      "aliexpress.ds.freight.query",
      "aliexpress.ds.category.get.list",
      "aliexpress.ds.order.create.normal",
    ];
    const results: Record<string, unknown> = {};
    for (const method of methods) {
      try {
        const data = await aeCall(method, { country: "CL", language: "es", currency: "CLP" });
        const str = JSON.stringify(data);
        if (str.includes("InvalidApiPath")) results[method] = "InvalidApiPath";
        else if (str.includes("InsufficientPermission")) results[method] = "InsufficientPermission";
        else if (str.includes("MissingParameter")) results[method] = "MissingParameter→" + (JSON.parse(str).error_response?.msg ?? "");
        else results[method] = JSON.parse(str);
      } catch (err) {
        results[method] = String(err);
      }
    }
    return Response.json(results);
  }

  try {
    const data = await aeCall("aliexpress.ds.recommend.feed.get", {
      product_id: "",
      country: "CL",
      language: "es",
      currency: "CLP",
      page_no: page,
      page_size: "20",
      keywords: q,
    });
    return Response.json({ status: 200, data });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
