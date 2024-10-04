package vn.bizup.projectbeta.utils;

public class VoucherCodeUtil {
    public static String uniqueCodeGenerator(String lastCode) {
        var initialPart = lastCode.split("-")[0];
        var nextNumber = Integer.parseInt(lastCode.split("-")[1], 10) + 1;
        return initialPart +
                "-" +
                String.format("%" + 6 + "s", nextNumber).replace(' ', '0');
    }
}
