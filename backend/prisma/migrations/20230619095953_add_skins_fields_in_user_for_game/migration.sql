-- AlterTable
ALTER TABLE "User" ADD COLUMN     "selectedBall" TEXT NOT NULL DEFAULT 'src/lib/assets/balls/ballWhite.png',
ADD COLUMN     "selectedBoard" TEXT NOT NULL DEFAULT 'src/lib/assets/boards/boardDefault.png',
ADD COLUMN     "selectedMyPaddle" TEXT NOT NULL DEFAULT 'src/lib/assets/paddles/defaultPaddle/defaultPaddleWhite.png',
ADD COLUMN     "selectedOpponentPaddle" TEXT NOT NULL DEFAULT 'src/lib/assets/paddles/defaultPaddle/defaultPaddleWhite.png';
