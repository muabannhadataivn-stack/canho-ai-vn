import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/layout/StaticPageLayout";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng | canho.ai.vn",
  description:
    "Điều khoản sử dụng & miễn trừ trách nhiệm của canho.ai.vn — tính chất dịch vụ, giới hạn trách nhiệm về thông tin dự án, và quyền sở hữu trí tuệ.",
};

export default function DieuKhoanSuDungPage() {
  return (
    <StaticPageLayout title="Điều khoản sử dụng">
      <p>
        <strong>Áp dụng cho website canho.ai.vn</strong>
        <br />
        <strong>Cập nhật lần cuối:</strong> 07/08/2026
      </p>

      <h2>1. Chấp nhận điều khoản</h2>
      <p>
        Bằng việc truy cập và sử dụng canho.ai.vn (&ldquo;Website&rdquo;), Quý khách đồng ý bị ràng buộc bởi các Điều
        khoản sử dụng này. Nếu không đồng ý với bất kỳ nội dung nào, Quý khách vui lòng ngừng sử dụng Website.
      </p>

      <h2>2. Tính chất của dịch vụ</h2>
      <p>
        canho.ai.vn là nền tảng <strong>tổng hợp và hiển thị thông tin tham khảo</strong> về các dự án căn hộ chung cư,
        bao gồm nhưng không giới hạn: vị trí, tiến độ, tiện ích, khoảng giá tham khảo, và các nội dung mô tả (bao gồm
        nội dung được tạo hỗ trợ bởi công nghệ trí tuệ nhân tạo).
      </p>
      <p>canho.ai.vn:</p>
      <ul>
        <li>
          <strong>Không phải</strong> là chủ đầu tư, đơn vị phân phối, hoặc đại diện pháp lý của bất kỳ dự án bất động
          sản nào được hiển thị trên Website;
        </li>
        <li>
          <strong>Không</strong> tham gia vào bất kỳ giao dịch mua bán, đặt cọc, hay ký kết hợp đồng nào giữa người dùng
          và chủ đầu tư/bên môi giới;
        </li>
        <li>Đóng vai trò trung gian cung cấp thông tin và kết nối nhu cầu tư vấn, không phải bên bán hàng trực tiếp.</li>
      </ul>

      <h2>3. Miễn trừ trách nhiệm về tính chính xác của thông tin</h2>

      <h3>3.1. Nguồn dữ liệu và giới hạn</h3>
      <p>
        Thông tin trên Website được tổng hợp từ nhiều nguồn (bao gồm dữ liệu công khai, dữ liệu do đối tác cung cấp, và
        thông tin do đội ngũ vận hành cập nhật), và có thể được diễn giải, tóm tắt hỗ trợ bởi công nghệ trí tuệ nhân
        tạo dựa trên dữ liệu đã có.
      </p>
      <p>
        Chúng tôi nỗ lực đảm bảo thông tin được cập nhật và chính xác ở mức tốt nhất có thể tại thời điểm hiển thị. Tuy
        nhiên, do đặc thù của thị trường bất động sản (giá cả, tiến độ, chính sách bán hàng thay đổi liên tục), chúng
        tôi <strong>không đảm bảo và không chịu trách nhiệm</strong> về:
      </p>
      <ul>
        <li>Tính chính xác tuyệt đối, đầy đủ, hoặc cập nhật theo thời gian thực của mọi thông tin hiển thị;</li>
        <li>
          Sai lệch phát sinh giữa thông tin hiển thị trên Website và thông tin thực tế tại thời điểm Quý khách giao
          dịch với chủ đầu tư/bên bán;
        </li>
        <li>
          Nội dung do trí tuệ nhân tạo tạo ra có thể chứa diễn giải chưa hoàn toàn chính xác, dù được xây dựng dựa trên
          dữ liệu có sẵn.
        </li>
      </ul>

      <h3>3.2. Khuyến nghị bắt buộc trước khi giao dịch</h3>
      <p>
        <strong>Mọi thông tin trên Website chỉ mang tính chất tham khảo ban đầu.</strong> Trước khi đưa ra bất kỳ quyết
        định tài chính nào (đặt cọc, ký hợp đồng mua bán, thanh toán), Quý khách có trách nhiệm:
      </p>
      <ul>
        <li>
          Tự mình xác minh lại thông tin trực tiếp với chủ đầu tư, đơn vị phân phối chính thức, hoặc cơ quan nhà nước
          có thẩm quyền (Sở Xây dựng, Sở Tài nguyên và Môi trường...);
        </li>
        <li>
          Kiểm tra tính pháp lý của dự án (giấy phép xây dựng, giấy chứng nhận quyền sử dụng đất, văn bản nghiệm
          thu...) qua các kênh chính thức;
        </li>
        <li>Tham vấn ý kiến chuyên gia pháp lý/tài chính độc lập nếu cần thiết.</li>
      </ul>
      <p>
        canho.ai.vn không phải là đơn vị tư vấn đầu tư, tư vấn pháp lý, hay tư vấn tài chính, và không đưa ra khuyến
        nghị đầu tư dưới bất kỳ hình thức nào.
      </p>

      <h2>4. Giới hạn trách nhiệm pháp lý</h2>
      <p>
        Trong phạm vi tối đa được pháp luật cho phép, canho.ai.vn không chịu trách nhiệm đối với bất kỳ thiệt hại trực
        tiếp, gián tiếp, ngẫu nhiên, đặc biệt, hoặc hệ quả nào phát sinh từ:
      </p>
      <ul>
        <li>Việc sử dụng hoặc không thể sử dụng Website;</li>
        <li>Việc dựa vào thông tin hiển thị trên Website để ra quyết định giao dịch;</li>
        <li>Giao dịch phát sinh giữa Quý khách và chủ đầu tư/bên môi giới sau khi được kết nối qua Website;</li>
        <li>Lỗi kỹ thuật, gián đoạn dịch vụ, hoặc mất dữ liệu ngoài khả năng kiểm soát hợp lý của chúng tôi.</li>
      </ul>

      <h2>5. Nội dung do bên thứ ba cung cấp</h2>
      <p>
        Website có thể hiển thị liên kết hoặc nội dung liên kết tới nền tảng của bên thứ ba (ví dụ: &ldquo;Chợ Cư
        Dân&rdquo;). Chúng tôi không kiểm soát và không chịu trách nhiệm về nội dung, chính sách bảo mật, hoặc hoạt
        động của các nền tảng bên thứ ba này. Việc Quý khách truy cập các liên kết đó tuân theo điều khoản riêng của
        từng nền tảng.
      </p>

      <h2>6. Quyền sở hữu trí tuệ</h2>
      <p>
        Toàn bộ giao diện, mã nguồn, thiết kế, cơ sở dữ liệu dự án, và nội dung gốc (bao gồm nội dung mô tả được hỗ trợ
        tạo bởi trí tuệ nhân tạo) do canho.ai.vn xây dựng thuộc quyền sở hữu của Canho.ai.vn.
      </p>
      <div className="mt-2 overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Loại tài sản</th>
              <th>Quyền của người dùng</th>
              <th>Hành vi bị nghiêm cấm</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cơ sở dữ liệu dự án (vị trí, tiến độ, tiện ích, giá tham khảo...)</td>
              <td>Tra cứu cá nhân, tham khảo cho nhu cầu tìm hiểu/giao dịch của riêng mình</td>
              <td>Dùng phần mềm tự động (bot, scraper, crawler) để thu thập, trích xuất dữ liệu hàng loạt khỏi Website</td>
            </tr>
            <tr>
              <td>Nội dung mô tả dự án, bài viết (kể cả nội dung do AI hỗ trợ tạo)</td>
              <td>Đọc, chia sẻ dưới dạng đường dẫn (link) kèm ghi nguồn rõ ràng</td>
              <td>
                Sao chép, biên tập lại (spin content) và đăng tải dưới danh nghĩa khác mà không có sự cho phép bằng văn
                bản
              </td>
            </tr>
            <tr>
              <td>Giao diện, mã nguồn Website</td>
              <td>Sử dụng trực tiếp qua trình duyệt</td>
              <td>Sao chép mã nguồn, dịch ngược (reverse engineer), hoặc sao chép giao diện cho mục đích thương mại khác</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Hình ảnh dự án hiển thị trên Website (nếu có) được sử dụng với mục đích minh họa thông tin, thuộc bản quyền của
        chủ đầu tư hoặc nguồn cung cấp tương ứng.
      </p>

      <h2>6a. Quy trình xử lý khiếu nại về thông tin dự án</h2>
      <p>
        Chúng tôi tôn trọng quyền lợi hợp pháp của các chủ đầu tư và đơn vị phát triển dự án. Nếu có bất kỳ thông tin
        nào về một dự án được cho là chưa chính xác, quy trình xử lý như sau:
      </p>
      <ol>
        <li>
          <strong>Tiếp nhận</strong>: Đại diện hợp pháp của chủ đầu tư gửi yêu cầu chính thức qua kênh hỗ trợ (điện
          thoại/email tại Mục 9).
        </li>
        <li>
          <strong>Cung cấp căn cứ</strong>: Đơn vị yêu cầu cần cung cấp tài liệu chứng minh (ví dụ: bảng giá chính thức
          có đóng dấu, văn bản điều chỉnh chính sách, giấy tờ pháp lý liên quan).
        </li>
        <li>
          <strong>Xác minh và điều chỉnh</strong>: Đội ngũ quản trị sẽ xác minh và cập nhật lại thông tin trong thời
          gian hợp lý (đề xuất: trong vòng 48–72 giờ làm việc kể từ khi nhận đủ căn cứ).
        </li>
      </ol>

      <h2>6b. Thông báo về tính năng liên hệ qua SMS</h2>
      <p>
        Website tích hợp tính năng chuyển hướng sang ứng dụng tin nhắn SMS để hỗ trợ Quý khách liên hệ tư vấn nhanh
        chóng. Quý khách lưu ý:
      </p>
      <ul>
        <li>
          Khi nhấn vào nút liên hệ dạng SMS trên trang chi tiết dự án, ứng dụng nhắn tin trên thiết bị của Quý khách sẽ
          tự động mở với nội dung soạn sẵn, gửi tới đầu số <strong>0523.888.868</strong>;
        </li>
        <li>
          Cước phí tin nhắn (nếu có) được tính theo biểu giá của nhà mạng viễn thông Quý khách đang sử dụng. canho.ai.vn
          không thu bất kỳ khoản phí nào cho thao tác này;
        </li>
        <li>Quý khách có toàn quyền chỉnh sửa hoặc không gửi tin nhắn sau khi ứng dụng nhắn tin đã mở.</li>
      </ul>

      <h2>7. Thay đổi dịch vụ</h2>
      <p>
        Chúng tôi có quyền chỉnh sửa, tạm ngừng, hoặc chấm dứt bất kỳ phần nào của Website mà không cần thông báo
        trước, nhằm mục đích cải thiện dịch vụ hoặc tuân thủ quy định pháp luật.
      </p>

      <h2>8. Luật áp dụng</h2>
      <p>
        Điều khoản này được điều chỉnh và giải thích theo pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam. Mọi tranh
        chấp phát sinh sẽ được ưu tiên giải quyết thông qua thương lượng; nếu không đạt được thỏa thuận, tranh chấp sẽ
        được đưa ra Tòa án có thẩm quyền theo quy định pháp luật.
      </p>

      <h2>9. Thông tin liên hệ</h2>
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
    </StaticPageLayout>
  );
}
