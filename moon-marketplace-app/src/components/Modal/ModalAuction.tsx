import React, { useState } from "react";
import { Dialog } from "@mui/material";
import useErrorNotification from "../../hooks/useErrorNotification";
import { isEmpty } from "../../helpers/check";

const data = [
  {
    heading: "",
    description: "",
    btnValue: "",
  },
  {
    heading: "Send a Bid",
    description:
      "Send higher bid than others to increase your chances of getting this Avatar.",
    inputs: [
      {
        placeholder: "Price",
        unit: "MOON",
      },
    ],
    btnValue: "Send a Bid",
  },
  {
    heading: "Put on Auction",
    description:
      "Put your Reddit Avatar on Auction and get the best price from bidders.",
    subdescription:
      "Putting Avatars on Auction is Free of Charge but 5% Marketplace Fee is Taken After Successfully Selling Your Avatar.",
    inputs: [
      {
        placeholder: "Starting Price",
        unit: "MOON",
      },
      {
        placeholder: "Ending Price",
        unit: "MOON",
      },
      {
        placeholder: "Duration",
        unit: "Days",
      },
    ],
    btnValue: "Put on Auction",
  },
];

interface Props {
  open: boolean;
  onClose: any;
  onSubmit: any;
  type: number;
}

const ModalAuction: React.FC<Props> = (props) => {
  const [values, setValues] = useState(["", "", ""]);
  const errorNotification = useErrorNotification();

  const submitHandler = async () => {
    if (
      isEmpty(values[0]) ||
      (props.type === 2 && (isEmpty(values[1]) || isEmpty(values[2]))) ||
      parseFloat(values[0]) < 0 ||
      (props.type === 2 &&
        (parseFloat(values[1]) < 0 || parseFloat(values[2]) < 0))
    ) {
      errorNotification.setError("Invalid value");
      return;
    }
    if (props.type === 2 && parseFloat(values[0]) > parseFloat(values[1])) {
      errorNotification.setError("Ending Price must be higher than Starting");
      return;
    }
    await props.onSubmit(...values.map((e) => parseFloat(e)));
  };

  const changeHandler = (e: any, idx: any) => {
    const newValues = [...values];
    newValues[idx] = e.target.value;
    setValues(newValues);
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      PaperProps={{
        sx: {
          bgcolor: "#09080D",
          color: "white",
          width: "80%",
          padding: {
            xs: "30px 10px",
            sm: "40px 30px",
            md: "50px 80px",
          },
        },
      }}
    >
      <div className="row">
        <div className="col-12 pb-3">
          <h2 className="search-title mt-0 mb-3">
            {data[props.type]?.heading ?? ""}
          </h2>
          <p>{data[props.type]?.description ?? ""}</p>
        </div>
      </div>
      {data[props.type].inputs &&
        data[props.type].inputs?.map((element, id) => (
          <div className="row" key={element.placeholder}>
            <div className="col-12 input-group mt-4 position-relative">
              <input
                type="number"
                className="rounded-pill border-white"
                style={{
                  paddingLeft: "24px",
                  paddingRight: "80px",
                }}
                placeholder={element.placeholder}
                value={values[id]}
                onChange={(e) => changeHandler(e, id)}
              />
              <span
                className="position-absolute"
                style={{ right: "36px", top: "14px" }}
              >
                {element.unit}
              </span>
            </div>
          </div>
        ))}

      {data[props.type].subdescription && (
        <div className="row">
          <div className="col-12 mt-5">
            <p style={{ fontSize: "90%" }}>{data[props.type].subdescription}</p>
          </div>
        </div>
      )}
      <div className="row">
        <div className="col-12 input-group justify-content-center mt-4">
          <button
            className="btn btn-bordered-white mt-3 px"
            onClick={submitHandler}
          >
            {data[props.type].btnValue ?? ""}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ModalAuction;
