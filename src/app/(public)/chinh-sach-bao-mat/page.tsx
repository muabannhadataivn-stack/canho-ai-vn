import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/layout/StaticPageLayout";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | canho.ai.vn",
  description:
    "Chính sách bảo mật của canho.ai.vn — cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân khi Quý khách sử dụng Website.",
};

export default function ChinhSachBaoMatPage() {
  return (
    <StaticPageLayout title="Chính sách bảo mật">
      <p>
        <strong>Áp dụng cho website canho.ai.vn</strong>
        <br />
        <strong>Cập nhật lần cuối:</strong> 07/08/2026
      </p>

      <h2>1. Giới thiệu chung</h2>
      <p>
        canho.ai.vn (sau đây gọi là &ldquo;Website&rdquo;, &ldquo;chúng tôi&rdquo;) là nền tảng tra cứu thông tin dự án
        căn hộ chung cư, do Canho.ai.vn vận hành.
      </p>
      <p>
        Chính sách này giải thích chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân của Quý khách như thế
        nào khi truy cập và sử dụng Website. Bằng việc sử dụng Website, đặc biệt là khi điền và gửi biểu mẫu &ldquo;Đăng
        ký tư vấn&rdquo;, Quý khách xác nhận đã đọc, hiểu và đồng ý với Chính sách này.
      </p>
      <p>Chính sách được xây dựng trên cơ sở tuân thủ:</p>
      <ul>
        <li>Nghị định số 13/2023/NĐ-CP ngày 17/04/2023 của Chính phủ về bảo vệ dữ liệu cá nhân;</li>
        <li>Luật An toàn thông tin mạng số 86/2015/QH13;</li>
        <li>Luật An ninh mạng số 24/2018/QH14;</li>
        <li>Các quy định pháp luật khác có liên quan hiện hành.</li>
      </ul>

      <h2>2. Dữ liệu cá nhân chúng tôi thu thập</h2>
      <p>
        Chúng tôi chỉ thu thập dữ liệu cá nhân khi Quý khách <strong>chủ động cung cấp</strong>, cụ thể qua biểu mẫu
        &ldquo;Đăng ký tư vấn&rdquo; trên trang chi tiết dự án, bao gồm:
      </p>
      <div className="mt-2 overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Loại dữ liệu</th>
              <th>Bắt buộc</th>
              <th>Mục đích</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Họ và tên</td>
              <td>Có</td>
              <td>Xác định người liên hệ, xưng hô khi tư vấn</td>
            </tr>
            <tr>
              <td>Số điện thoại</td>
              <td>Có</td>
              <td>Liên hệ tư vấn trực tiếp qua điện thoại/SMS</td>
            </tr>
            <tr>
              <td>Địa chỉ email</td>
              <td>Không (chỉ khi Quý khách chọn &ldquo;nhận báo cáo qua email&rdquo;)</td>
              <td>Gửi thông tin/báo cáo liên quan dự án Quý khách quan tâm</td>
            </tr>
            <tr>
              <td>Tên dự án quan tâm</td>
              <td>Tự động ghi nhận</td>
              <td>Xác định đúng nhu cầu tư vấn</td>
            </tr>
            <tr>
              <td>Thời điểm gửi yêu cầu</td>
              <td>Tự động ghi nhận</td>
              <td>Quản lý và xử lý yêu cầu theo thứ tự</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Chúng tôi <strong>không</strong> thu thập: số CMND/CCCD, thông tin tài khoản ngân hàng, mật khẩu, hoặc bất kỳ dữ
        liệu nhạy cảm nào khác qua Website.
      </p>
      <p>
        Ngoài ra, Website có thể tự động ghi nhận một số dữ liệu kỹ thuật không định danh cá nhân trực tiếp (địa chỉ IP,
        loại trình duyệt, thời gian truy cập) phục vụ mục đích thống kê lưu lượng và bảo mật hệ thống.
      </p>

      <h2>3. Mục đích sử dụng dữ liệu</h2>
      <p>
        Dữ liệu cá nhân Quý khách cung cấp được sử dụng cho các mục đích sau, và <strong>chỉ những mục đích này</strong>:
      </p>
      <ol>
        <li>Liên hệ tư vấn về dự án bất động sản Quý khách quan tâm;</li>
        <li>Gửi thông tin/báo cáo liên quan dự án (nếu Quý khách yêu cầu nhận qua email);</li>
        <li>Cải thiện chất lượng dịch vụ tư vấn của chúng tôi;</li>
        <li>Thực hiện nghĩa vụ theo quy định pháp luật khi có yêu cầu từ cơ quan nhà nước có thẩm quyền.</li>
      </ol>
      <p>
        Chúng tôi <strong>không</strong> sử dụng dữ liệu Quý khách cho mục đích quảng cáo của bên thứ ba không liên quan
        đến nhu cầu bất động sản Quý khách đã thể hiện, trừ khi có sự đồng ý riêng của Quý khách.
      </p>

      <h2>4. Chia sẻ dữ liệu với bên thứ ba</h2>
      <p>
        Chúng tôi cam kết <strong>không bán, không cho thuê, không trao đổi</strong> dữ liệu cá nhân của Quý khách cho
        bất kỳ bên thứ ba nào vì mục đích thương mại.
      </p>
      <p>Dữ liệu chỉ được chia sẻ trong các trường hợp:</p>
      <ul>
        <li>Với đội ngũ tư vấn nội bộ của chúng tôi, để thực hiện đúng mục đích Quý khách đã yêu cầu;</li>
        <li>
          Với nhà cung cấp dịch vụ kỹ thuật (hosting, cơ sở dữ liệu, dịch vụ gửi email/SMS) — các bên này chỉ được tiếp
          cận dữ liệu ở mức cần thiết để vận hành hệ thống, và có nghĩa vụ bảo mật tương đương;
        </li>
        <li>Khi có yêu cầu hợp pháp từ cơ quan nhà nước có thẩm quyền theo quy định pháp luật.</li>
      </ul>
      <p>
        Một phần hạ tầng kỹ thuật (lưu trữ cơ sở dữ liệu) của chúng tôi có thể đặt tại máy chủ ở nước ngoài, thuộc nhà
        cung cấp dịch vụ điện toán đám mây uy tín quốc tế. Việc này được thực hiện phù hợp với quy định pháp luật Việt
        Nam về chuyển dữ liệu cá nhân ra nước ngoài, và chỉ nhằm mục đích vận hành kỹ thuật hệ thống, không nhằm mục
        đích chuyển giao quyền kiểm soát dữ liệu cho bên thứ ba.
      </p>

      <h2>5. Thời gian lưu trữ dữ liệu</h2>
      <p>
        Dữ liệu cá nhân được lưu trữ trong thời gian cần thiết để thực hiện mục đích thu thập ban đầu, hoặc theo thời
        hạn quy định pháp luật (nếu có), sau đó sẽ được xóa hoặc ẩn danh hóa, trừ trường hợp pháp luật có quy định lưu
        trữ lâu hơn.
      </p>

      <h2>6. Quyền của chủ thể dữ liệu</h2>
      <p>Theo Nghị định 13/2023/NĐ-CP, Quý khách có các quyền sau đối với dữ liệu cá nhân của mình:</p>
      <ul>
        <li>
          <strong>Quyền được biết</strong>: về hoạt động xử lý dữ liệu cá nhân của mình;
        </li>
        <li>
          <strong>Quyền đồng ý/rút lại sự đồng ý</strong>: đối với việc xử lý dữ liệu cá nhân;
        </li>
        <li>
          <strong>Quyền truy cập</strong>: xem lại dữ liệu cá nhân đã cung cấp;
        </li>
        <li>
          <strong>Quyền yêu cầu chỉnh sửa</strong>: nếu dữ liệu không chính xác;
        </li>
        <li>
          <strong>Quyền xóa dữ liệu</strong>: yêu cầu xóa dữ liệu cá nhân trong các trường hợp pháp luật cho phép;
        </li>
        <li>
          <strong>Quyền khiếu nại, tố cáo, khởi kiện</strong>: theo quy định pháp luật nếu quyền lợi bị xâm phạm.
        </li>
      </ul>
      <p>Để thực hiện các quyền trên, Quý khách vui lòng liên hệ qua thông tin tại Mục 8.</p>

      <h2>7. Biện pháp bảo mật</h2>
      <p>
        Chúng tôi áp dụng các biện pháp kỹ thuật và quản lý hợp lý để bảo vệ dữ liệu cá nhân khỏi truy cập trái phép,
        mất mát, hoặc sử dụng sai mục đích, bao gồm: mã hóa kết nối (HTTPS), kiểm soát quyền truy cập nội bộ, và giới
        hạn nhân sự được phép tiếp cận dữ liệu.
      </p>
      <p>
        Tuy nhiên, không có phương thức truyền tải hoặc lưu trữ điện tử nào an toàn tuyệt đối 100%. Chúng tôi nỗ lực
        bảo vệ dữ liệu ở mức tốt nhất nhưng không thể đảm bảo an toàn tuyệt đối.
      </p>

      <h2>8. Thông tin liên hệ</h2>
      <p>
        Mọi thắc mắc, yêu cầu liên quan đến Chính sách bảo mật này hoặc việc thực hiện quyền đối với dữ liệu cá nhân,
        Quý khách vui lòng liên hệ:
      </p>
      <ul>
        <li>
          Email: <a href="mailto:hotro.nhaonline@gmail.com">hotro.nhaonline@gmail.com</a>
        </li>
        <li>
          Hotline: <a href="tel:0523888868">0523.888.868</a>
        </li>
        <li>Địa chỉ: 614-616-618 Đường 3/2, Phường Diên Hồng, TP. Hồ Chí Minh</li>
        <li>Website: canho.ai.vn</li>
      </ul>

      <h2>9. Thay đổi Chính sách</h2>
      <p>
        Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian để phản ánh thay đổi trong hoạt động hoặc quy
        định pháp luật. Phiên bản cập nhật sẽ được đăng tải tại URL này, ngày cập nhật cuối cùng được ghi rõ ở đầu văn
        bản.
      </p>
    </StaticPageLayout>
  );
}
