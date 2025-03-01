import React, { useState, useEffect } from "react";
import Select from "react-select";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import supabase from "../../../config/supabaseClient";

const VenueSequenceEditor = () => {
  const [venues, setVenues] = useState([]);
  const [selectedVenues, setSelectedVenues] = useState([]);
  const [initialSequence, setInitialSequence] = useState([]);

  useEffect(() => {
    const fetchVenues = async () => {
      const { data, error } = await supabase.from("venues").select("id, venue_name");
      if (error) console.error("Error fetching venues:", error);
      else setVenues(data);
    };
    fetchVenues();
  }, []);

  useEffect(() => {
    const fetchSequence = async () => {
      const { data, error } = await supabase
        .from("tbl_sequence")
        .select("sequence")
        .eq("category", "venues")
        .single();

      if (error) {
        console.error("Error fetching sequence:", error);
      } else if (data) {
        setInitialSequence(data.sequence || []);
        setSelectedVenues(
          data.sequence.map((item) => ({
            id: item.id,
            venue_name: venues.find((v) => v.id === item.id)?.venue_name || "Unknown",
            position: item.position,
          }))
        );
      }
    };

    if (venues.length > 0) fetchSequence();
  }, [venues]);

  const handleSelectChange = (selectedOptions) => {
    const newSelected = selectedOptions.map((option, index) => ({
      id: option.value,
      venue_name: option.label,
      position: index + 1,
    }));

    setSelectedVenues(newSelected);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = selectedVenues.findIndex((item) => item.id === active.id);
    const newIndex = selectedVenues.findIndex((item) => item.id === over.id);
    const newList = arrayMove(selectedVenues, oldIndex, newIndex).map((item, index) => ({
      ...item,
      position: index + 1,
    }));

    setSelectedVenues(newList);
  };

  const handleSave = async () => {
    const orderedData = selectedVenues.map(({ id, position }) => ({ id, position }));
    const category = "venues";

    const { error } = await supabase.from("tbl_sequence").upsert([
      { category, sequence: orderedData },
    ], { onConflict: ["category"] });

    if (error) console.error("Error saving sequence:", error);
    else alert("Sequence saved!");
  };

  return (
    <div>
      <h2>Venue Sequence Editor</h2>

      <Select
        options={venues.map((venue) => ({ value: venue.id, label: venue.venue_name }))}
        isMulti
        onChange={handleSelectChange}
        placeholder="Select venues..."
        value={selectedVenues.map((v) => ({ value: v.id, label: v.venue_name }))}
      />

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={selectedVenues.map((v) => v.id)} strategy={verticalListSortingStrategy}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {selectedVenues.map((venue) => (
              <SortableItem key={venue.id} venue={venue} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <button onClick={handleSave} style={{ marginTop: "10px" }}>
        Save Sequence
      </button>
    </div>
  );
};

const SortableItem = ({ venue }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: venue.id });

  const style = {
    padding: "10px",
    margin: "5px 0",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ccc",
    cursor: "grab",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>{venue.position}.</strong> {venue.venue_name}
    </li>
  );
};

export default VenueSequenceEditor;
